import { describe, it, expect } from "vitest";
import { checkRateLimit } from "@/lib/security/rate-limit";

describe("Rate Limiter (Distributed & Memory Fallback)", () => {
  it("allows requests under the threshold", async () => {
    const testIp = "192.168.1.100";
    const res1 = await checkRateLimit(testIp, { maxRequests: 3, windowMs: 1000 });
    expect(res1.isRateLimited).toBe(false);
    expect(res1.remaining).toBe(2);

    const res2 = await checkRateLimit(testIp, { maxRequests: 3, windowMs: 1000 });
    expect(res2.isRateLimited).toBe(false);
    expect(res2.remaining).toBe(1);
  });

  it("blocks requests once maximum limit is reached", async () => {
    const testIp = "192.168.1.200";
    await checkRateLimit(testIp, { maxRequests: 2, windowMs: 1000 });
    await checkRateLimit(testIp, { maxRequests: 2, windowMs: 1000 });

    const blocked = await checkRateLimit(testIp, { maxRequests: 2, windowMs: 1000 });
    expect(blocked.isRateLimited).toBe(true);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetTimeMs).toBeGreaterThan(0);
  });
});
