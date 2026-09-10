import { NextRequest, NextResponse } from "next/server";
import { validateFeedbackPayload } from "@/lib/validation/feedback";
import { checkRateLimit, getClientIp, RateLimitConfigError } from "@/lib/security/rate-limit";
import { isGeminiConfigured, getGoogleReviewUrl, redactSensitiveData } from "@/lib/gemini/client";
import { generateReviewWithGemini, GeminiGenerationError } from "@/lib/gemini/generate-review";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // 1. Check client rate limit to protect public QR endpoint (Upstash Redis in prod / Dev memory fallback)
  const clientIp = getClientIp(request.headers);
  let rateLimit;
  try {
    rateLimit = await checkRateLimit(clientIp);
  } catch (err: unknown) {
    if (err instanceof RateLimitConfigError) {
      console.error("[ReviewFlow API] Production rate limit configuration error:", err.message);
      return NextResponse.json(
        {
          error: "Rate limiting service is misconfigured. Upstash Redis configuration is required in production.",
          source: "rate_limit_config",
          google_review_url: getGoogleReviewUrl(),
        },
        { status: 500 }
      );
    }
    console.error("[ReviewFlow API] Rate limit check error:", err);
    return NextResponse.json(
      {
        error: "Rate limiting service unavailable. Please try again later.",
        source: "rate_limit_error",
        google_review_url: getGoogleReviewUrl(),
      },
      { status: 500 }
    );
  }

  const rateLimitHeaders = {
    "X-RateLimit-Limit": String(rateLimit.limit),
    "X-RateLimit-Remaining": String(rateLimit.remaining),
    "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetTimeMs / 1000)),
  };

  if (rateLimit.isRateLimited) {
    const retryAfterSec = Math.ceil(rateLimit.resetTimeMs / 1000);
    return NextResponse.json(
      {
        error: "Too many feedback submissions. Please try again in a few minutes.",
        source: "rate_limit",
        google_review_url: getGoogleReviewUrl(),
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
          ...rateLimitHeaders,
        },
      }
    );
  }

  // 2. Reject oversized payloads (prevent memory exhaustion / DoS)
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 10240) {
    return NextResponse.json(
      { error: "Request payload too large. Maximum size is 10 KB." },
      { status: 413 }
    );
  }

  // 3. Parse JSON safely
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request payload." },
      { status: 400 }
    );
  }

  // 4. Validate and sanitize feedback payload
  const validation = validateFeedbackPayload(rawBody);
  if (!validation.isValid || !validation.data) {
    return NextResponse.json(
      { error: validation.error || "Invalid feedback payload." },
      { status: 400 }
    );
  }

  // 5. Verify Gemini API key configuration
  if (!isGeminiConfigured()) {
    console.warn("[ReviewFlow API] Request failed: GEMINI_API_KEY is not configured.");
    return NextResponse.json(
      {
        error: "GEMINI_API_KEY is not configured in .env. Please set GEMINI_API_KEY.",
        source: "error",
        google_review_url: getGoogleReviewUrl(),
      },
      { status: 503 }
    );
  }

  // 6. Generate review draft via Gemini
  try {
    console.log(`[ReviewFlow API] Generating review for client ${clientIp}`);
    const review = await generateReviewWithGemini(validation.data);
    console.log(`[ReviewFlow API] Successfully generated review draft`);

    return NextResponse.json(
      {
        review,
        source: "Gemini",
        google_review_url: getGoogleReviewUrl(),
      },
      {
        status: 200,
        headers: rateLimitHeaders,
      }
    );
  } catch (err: unknown) {
    if (err instanceof GeminiGenerationError) {
      console.error(
        `[ReviewFlow API] Gemini generation error (${err.statusCode}):`,
        err.originalMessage || err.message
      );
      return NextResponse.json(
        {
          error: err.message,
          details: err.originalMessage,
          source: "error",
          google_review_url: getGoogleReviewUrl(),
        },
        { status: err.statusCode }
      );
    }

    const rawMsg = err instanceof Error ? err.message : "Unexpected server error";
    const safeMsg = redactSensitiveData(rawMsg);
    console.error("[ReviewFlow API] Unexpected error in generate endpoint:", safeMsg);

    return NextResponse.json(
      {
        error: "An unexpected error occurred while generating the review.",
        details: safeMsg.slice(0, 160),
        source: "error",
        google_review_url: getGoogleReviewUrl(),
      },
      { status: 500 }
    );
  }
}
