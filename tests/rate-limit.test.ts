import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  checkRateLimit,
  getClientIp,
  RateLimitConfigError,
  _resetRateLimiterState,
  _setUpstashLimiter,
  isUpstashConfigured,
} from "@/lib/security/rate-limit";
import { POST } from "@/app/api/generate/route";
import { NextRequest } from "next/server";
import type { Ratelimit } from "@upstash/ratelimit";

describe("Rate Limiting (Upstash Redis & Development Fallback)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    process.env.NODE_ENV = "test";
    _resetRateLimiterState();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    _resetRateLimiterState();
    vi.restoreAllMocks();
  });

  describe("Under Limit & Limit Boundaries (15 requests per 10 minutes)", () => {
    it("allows requests under the limit of 15 requests", async () => {
      const clientIp = "192.168.1.50";

      for (let i = 1; i <= 15; i++) {
        const res = await checkRateLimit(clientIp);
        expect(res.isRateLimited).toBe(false);
        expect(res.limit).toBe(15);
        expect(res.remaining).toBe(15 - i);
        expect(res.resetTimeMs).toBeGreaterThan(0);
      }
    });

    it("rejects the 16th request within the 10-minute window", async () => {
      const clientIp = "192.168.1.51";

      // 15 allowed requests
      for (let i = 0; i < 15; i++) {
        const res = await checkRateLimit(clientIp);
        expect(res.isRateLimited).toBe(false);
      }

      // 16th request must be rejected
      const sixteenth = await checkRateLimit(clientIp);
      expect(sixteenth.isRateLimited).toBe(true);
      expect(sixteenth.remaining).toBe(0);
      expect(sixteenth.limit).toBe(15);
      expect(sixteenth.resetTimeMs).toBeGreaterThan(0);
    });

    it("handles correct rate-limit metadata structure", async () => {
      const clientIp = "192.168.1.52";
      const res = await checkRateLimit(clientIp);

      expect(res).toHaveProperty("isRateLimited");
      expect(res).toHaveProperty("remaining");
      expect(res).toHaveProperty("resetTimeMs");
      expect(res).toHaveProperty("limit");

      expect(typeof res.isRateLimited).toBe("boolean");
      expect(typeof res.remaining).toBe("number");
      expect(typeof res.resetTimeMs).toBe("number");
      expect(typeof res.limit).toBe("number");
      expect(res.limit).toBe(15);
    });
  });

  describe("Development Fallback", () => {
    it("works smoothly when Upstash configuration is unavailable in development", async () => {
      process.env.NODE_ENV = "development";
      expect(isUpstashConfigured()).toBe(false);

      const clientIp = "10.0.0.1";
      const res = await checkRateLimit(clientIp);

      expect(res.isRateLimited).toBe(false);
      expect(res.remaining).toBe(14);
      expect(res.limit).toBe(15);
    });
  });

  describe("Production Strict Configuration", () => {
    it("does NOT silently downgrade to local in-memory protection in production when Upstash is missing", async () => {
      process.env.NODE_ENV = "production";
      expect(isUpstashConfigured()).toBe(false);

      await expect(checkRateLimit("10.0.0.2")).rejects.toThrow(RateLimitConfigError);
      await expect(checkRateLimit("10.0.0.2")).rejects.toThrow(
        /Upstash Redis rate limiting is misconfigured in production/i
      );
    });
  });

  describe("Mocked Upstash Redis Integration", () => {
    it("delegates to Upstash Ratelimit when configured and handles allowed response", async () => {
      const resetTime = Date.now() + 500000;
      const mockLimiter = {
        limit: vi.fn().mockResolvedValue({
          success: true,
          limit: 15,
          remaining: 14,
          reset: resetTime,
        }),
      } as unknown as Ratelimit;

      _setUpstashLimiter(mockLimiter);

      const res = await checkRateLimit("203.0.113.10");

      expect(mockLimiter.limit).toHaveBeenCalledWith("203.0.113.10");
      expect(res.isRateLimited).toBe(false);
      expect(res.limit).toBe(15);
      expect(res.remaining).toBe(14);
      expect(res.resetTimeMs).toBeGreaterThan(0);
    });

    it("delegates to Upstash Ratelimit and handles rejected 16th request", async () => {
      const resetTime = Date.now() + 300000;
      const mockLimiter = {
        limit: vi.fn().mockResolvedValue({
          success: false,
          limit: 15,
          remaining: 0,
          reset: resetTime,
        }),
      } as unknown as Ratelimit;

      _setUpstashLimiter(mockLimiter);

      const res = await checkRateLimit("203.0.113.11");

      expect(mockLimiter.limit).toHaveBeenCalledWith("203.0.113.11");
      expect(res.isRateLimited).toBe(true);
      expect(res.limit).toBe(15);
      expect(res.remaining).toBe(0);
      expect(res.resetTimeMs).toBeGreaterThan(0);
    });

    it("re-throws errors in production if Upstash request fails rather than silently downgrading", async () => {
      process.env.NODE_ENV = "production";

      const mockLimiter = {
        limit: vi.fn().mockRejectedValue(new Error("Redis connection timeout")),
      } as unknown as Ratelimit;

      _setUpstashLimiter(mockLimiter);

      await expect(checkRateLimit("203.0.113.12")).rejects.toThrow("Redis connection timeout");
    });
  });

  describe("API Route Integration (HTTP 429 & Headers)", () => {
    it("returns HTTP 429 and Retry-After header when client rate limit is exceeded", async () => {
      const targetIp = "198.51.100.99";

      // Exhaust the 15 requests in dev/test memory store
      for (let i = 0; i < 15; i++) {
        await checkRateLimit(targetIp);
      }

      const request = new NextRequest("http://localhost:3000/api/generate", {
        method: "POST",
        headers: {
          "x-forwarded-for": targetIp,
          "content-type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      expect(response.status).toBe(429);

      // Verify Retry-After header
      const retryAfter = response.headers.get("Retry-After");
      expect(retryAfter).toBeTruthy();
      expect(Number(retryAfter)).toBeGreaterThan(0);

      // Verify standard rate limit headers
      expect(response.headers.get("X-RateLimit-Limit")).toBe("15");
      expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
      expect(response.headers.get("X-RateLimit-Reset")).toBeTruthy();

      const body = await response.json();
      expect(body.source).toBe("rate_limit");
      expect(body.error).toContain("Too many feedback submissions");
    });

    it("returns HTTP 500 when production rate limiting is misconfigured", async () => {
      process.env.NODE_ENV = "production";

      const request = new NextRequest("http://localhost:3000/api/generate", {
        method: "POST",
        headers: {
          "x-forwarded-for": "198.51.100.100",
          "content-type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      expect(response.status).toBe(500);

      const body = await response.json();
      expect(body.source).toBe("rate_limit_config");
      expect(body.error).toContain("Upstash Redis configuration is required in production");
    });
  });

  describe("Client IP Extraction", () => {
    it("extracts the first IP from comma-separated x-forwarded-for", () => {
      const headers = new Headers({
        "x-forwarded-for": "203.0.113.195, 70.41.3.18, 150.172.238.178",
      });
      expect(getClientIp(headers)).toBe("203.0.113.195");
    });

    it("falls back to x-real-ip if x-forwarded-for is missing", () => {
      const headers = new Headers({
        "x-real-ip": "198.51.100.22",
      });
      expect(getClientIp(headers)).toBe("198.51.100.22");
    });

    it("falls back to cf-connecting-ip if others are missing", () => {
      const headers = new Headers({
        "cf-connecting-ip": "192.0.2.77",
      });
      expect(getClientIp(headers)).toBe("192.0.2.77");
    });

    it("defaults to 127.0.0.1 when no IP headers exist", () => {
      const headers = new Headers();
      expect(getClientIp(headers)).toBe("127.0.0.1");
    });
  });
});
