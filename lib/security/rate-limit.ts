import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Server-only runtime check to prevent accidental client execution
if (typeof window !== "undefined") {
  throw new Error("Rate limiting module can only be executed server-side.");
}

export class RateLimitConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitConfigError";
  }
}

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

// In-Memory fallback store for local development environments
interface MemoryRecord {
  timestamps: number[];
}

const inMemoryStore = new Map<string, MemoryRecord>();
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;

export function _resetMemoryStore(): void {
  inMemoryStore.clear();
  lastCleanup = Date.now();
}

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

export function checkMemoryRateLimit(
  identifier: string,
  maxRequests: number = 15,
  windowMs: number = 10 * 60 * 1000
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

export function isUpstashConfigured(): boolean {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return Boolean(url && token);
}

// Lazy initialization of Upstash Redis client
let upstashRatelimit: Ratelimit | null = null;
let isUpstashInitialized = false;

export function _resetRateLimiterState(): void {
  upstashRatelimit = null;
  isUpstashInitialized = false;
  _resetMemoryStore();
}

export function _setUpstashLimiter(limiter: Ratelimit | null): void {
  upstashRatelimit = limiter;
  isUpstashInitialized = true;
}

export function getUpstashLimiter(): Ratelimit | null {
  if (isUpstashInitialized) {
    return upstashRatelimit;
  }

  const isProd = process.env.NODE_ENV === "production";
  const configured = isUpstashConfigured();

  if (!configured) {
    if (isProd) {
      throw new RateLimitConfigError(
        "Upstash Redis rate limiting is misconfigured in production: " +
        "Missing required environment variables UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN. " +
        "In-memory fallback is disabled in production to prevent silent rate-limit bypasses across serverless instances."
      );
    }
    isUpstashInitialized = true;
    upstashRatelimit = null;
    return null;
  }

  try {
    const redis = Redis.fromEnv();
    upstashRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(15, "10m"),
      prefix: "reviewflow_rl",
      analytics: true,
    });
    isUpstashInitialized = true;
    return upstashRatelimit;
  } catch (err) {
    if (isProd) {
      throw new RateLimitConfigError(
        `Failed to initialize Upstash Redis rate limiter in production: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
    console.warn(
      "[ReviewFlow] Failed to initialize Upstash Redis in development, falling back to in-memory limiter:",
      err
    );
    isUpstashInitialized = true;
    upstashRatelimit = null;
    return null;
  }
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
      if (process.env.NODE_ENV === "production") {
        console.error(
          "[ReviewFlow] Upstash Redis request failed in production:",
          redisErr instanceof Error ? redisErr.message : redisErr
        );
        throw redisErr;
      }
      console.warn(
        "[ReviewFlow] Upstash Redis request failed in development, using in-memory fallback:",
        redisErr instanceof Error ? redisErr.message : redisErr
      );
      return checkMemoryRateLimit(identifier, maxRequests, windowMs);
    }
  }

  // Development-only in-memory fallback
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
