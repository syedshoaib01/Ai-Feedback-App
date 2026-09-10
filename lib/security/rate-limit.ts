import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitResult {
  isRateLimited: boolean;
  remaining: number;
  resetTimeMs: number;
  limit: number;
}

export interface RateLimitOptions {
  windowMs?: number; // e.g. 10 * 60 * 1000 (10 mins)
  maxRequests?: number; // e.g. 15 requests per 10 min
}

// In-Memory fallback store for environments without Upstash/Redis configured
interface MemoryRecord {
  timestamps: number[];
}

const inMemoryStore = new Map<string, MemoryRecord>();
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;

function cleanupMemoryStore(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  const threshold = now - windowMs;
  for (const [key, record] of inMemoryStore.entries()) {
    record.timestamps = record.timestamps.filter((t) => t > threshold);
    if (record.timestamps.length === 0) {
      inMemoryStore.delete(key);
    }
  }
}

function checkMemoryRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  cleanupMemoryStore(windowMs);

  const now = Date.now();
  const threshold = now - windowMs;

  const record = inMemoryStore.get(identifier) || { timestamps: [] };
  const recentTimestamps = record.timestamps.filter((t) => t > threshold);

  if (recentTimestamps.length >= maxRequests) {
    const oldest = recentTimestamps[0];
    const resetTimeMs = oldest + windowMs - now;
    return {
      isRateLimited: true,
      remaining: 0,
      resetTimeMs: Math.max(0, resetTimeMs),
      limit: maxRequests,
    };
  }

  recentTimestamps.push(now);
  inMemoryStore.set(identifier, { timestamps: recentTimestamps });

  return {
    isRateLimited: false,
    remaining: Math.max(0, maxRequests - recentTimestamps.length),
    resetTimeMs: windowMs,
    limit: maxRequests,
  };
}

// Lazy initialization of Upstash Redis client
let upstashRatelimit: Ratelimit | null = null;
let isUpstashInitialized = false;

function getUpstashLimiter(): Ratelimit | null {
  if (isUpstashInitialized) return upstashRatelimit;
  isUpstashInitialized = true;

  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (url && token) {
    try {
      const redis = new Redis({ url, token });
      upstashRatelimit = new Ratelimit({
        redis,
        // 15 requests per 10 minutes per IP
        limiter: Ratelimit.slidingWindow(15, "10 m"),
        prefix: "reviewflow_rl",
        analytics: true,
      });
      console.log("[ReviewFlow] Upstash distributed rate limiter active.");
    } catch (err) {
      console.warn("[ReviewFlow] Failed to initialize Upstash Redis, falling back to in-memory limiter:", err);
      upstashRatelimit = null;
    }
  }

  return upstashRatelimit;
}

export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): Promise<RateLimitResult> {
  const windowMs = options.windowMs || 10 * 60 * 1000; // 10 minutes
  const maxRequests = options.maxRequests || 15; // 15 requests per 10 minutes

  const limiter = getUpstashLimiter();

  if (limiter) {
    try {
      const res = await limiter.limit(identifier);
      return {
        isRateLimited: !res.success,
        remaining: res.remaining,
        resetTimeMs: Math.max(0, res.reset - Date.now()),
        limit: res.limit,
      };
    } catch (redisErr) {
      console.warn(
        "[ReviewFlow] Upstash Redis request failed, using in-memory fallback:",
        redisErr instanceof Error ? redisErr.message : redisErr
      );
      return checkMemoryRateLimit(identifier, maxRequests, windowMs);
    }
  }

  // Graceful fallback to memory limiter
  return checkMemoryRateLimit(identifier, maxRequests, windowMs);
}

export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }
  return "127.0.0.1";
}
