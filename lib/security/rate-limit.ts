interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 10 minutes
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleEntries(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  const threshold = now - windowMs;
  for (const [key, record] of rateLimitStore.entries()) {
    record.timestamps = record.timestamps.filter((t) => t > threshold);
    if (record.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitOptions {
  windowMs?: number; // e.g. 5 minutes
  maxRequests?: number; // e.g. 20 requests per window
}

export interface RateLimitResult {
  isRateLimited: boolean;
  remaining: number;
  resetTimeMs: number;
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const windowMs = options.windowMs || 5 * 60 * 1000; // 5 mins
  const maxRequests = options.maxRequests || 25; // 25 requests per 5 min

  cleanupStaleEntries(windowMs);

  const now = Date.now();
  const threshold = now - windowMs;

  const record = rateLimitStore.get(identifier) || { timestamps: [] };
  const recentTimestamps = record.timestamps.filter((t) => t > threshold);

  if (recentTimestamps.length >= maxRequests) {
    const oldest = recentTimestamps[0];
    const resetTimeMs = oldest + windowMs - now;
    return {
      isRateLimited: true,
      remaining: 0,
      resetTimeMs: Math.max(0, resetTimeMs),
    };
  }

  recentTimestamps.push(now);
  rateLimitStore.set(identifier, { timestamps: recentTimestamps });

  return {
    isRateLimited: false,
    remaining: maxRequests - recentTimestamps.length,
    resetTimeMs: windowMs,
  };
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
