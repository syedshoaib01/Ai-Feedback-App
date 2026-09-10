import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getGeminiApiKey,
  getGeminiModel,
  getGoogleReviewUrl,
  isGeminiConfigured,
  redactSensitiveData,
} from "@/lib/gemini/client";

describe("Gemini Client Configuration & Security", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("identifies when Gemini is configured", () => {
    process.env.GEMINI_API_KEY = "test-key-12345";
    expect(isGeminiConfigured()).toBe(true);
    expect(getGeminiApiKey()).toBe("test-key-12345");
  });

  it("identifies when Gemini is unconfigured", () => {
    delete process.env.GEMINI_API_KEY;
    expect(isGeminiConfigured()).toBe(false);
    expect(getGeminiApiKey()).toBe("");
  });

  it("falls back to default model if GEMINI_MODEL is not set", () => {
    delete process.env.GEMINI_MODEL;
    expect(getGeminiModel()).toBe("gemini-3.8-flash");
  });

  it("respects custom GEMINI_MODEL", () => {
    process.env.GEMINI_MODEL = "gemini-3.6-flash";
    expect(getGeminiModel()).toBe("gemini-3.6-flash");
  });

  it("retrieves Google Review URL when configured", () => {
    process.env.GOOGLE_REVIEW_URL = "https://maps.google.com/review";
    expect(getGoogleReviewUrl()).toBe("https://maps.google.com/review");
  });

  it("redacts API key from error strings", () => {
    process.env.GEMINI_API_KEY = "SECRET_API_KEY_987654";
    const sensitiveError = "Failed with key SECRET_API_KEY_987654 on endpoint";
    const redacted = redactSensitiveData(sensitiveError);
    expect(redacted).not.toContain("SECRET_API_KEY_987654");
    expect(redacted).toContain("[REDACTED_API_KEY]");
  });
});
