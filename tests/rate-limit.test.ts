import { describe, it, expect } from "vitest";
import { checkRateLimit } from "@/lib/security/rate-limit";

describe("Rate Limiter", () => {
  it("allows requests under the threshold", () => {
    const testIp = "192.168.1.100";
    const res1 = checkRateLimit(testIp, { maxRequests: 3, windowMs: 1000 });
    expect(res1.isRateLimited).toBe(false);
    expect(res1.remaining).toBe(2);

    const res2 = checkRateLimit(testIp, { maxRequests: 3, windowMs: 1000 });
    expect(res2.isRateLimited).toBe(false);
    expect(res2.remaining).toBe(1);
  });

  it("blocks requests once maximum limit is reached", () => {
    const testIp = "192.168.1.200";
    checkRateLimit(testIp, { maxRequests: 2, windowMs: 1000 });
    checkRateLimit(testIp, { maxRequests: 2, windowMs: 1000 });

    const blocked = checkRateLimit(testIp, { maxRequests: 2, windowMs: 1000 });
    expect(blocked.isRateLimited).toBe(true);
    expect(blocked.remaining).toBe(0);
  });
});
