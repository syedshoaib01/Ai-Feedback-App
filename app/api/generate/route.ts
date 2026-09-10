import { NextRequest, NextResponse } from "next/server";
import { generateWithGemini, getGoogleReviewUrl, isGeminiConfigured } from "@/lib/gemini";
import { FeedbackData } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: Partial<FeedbackData>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request payload." },
      { status: 400 }
    );
  }

  const requiredFields: Array<keyof FeedbackData> = [
    "food",
    "service",
    "ambience",
    "value",
    "overall",
  ];

  const missing = requiredFields.filter(
    (field) => body[field] === undefined || body[field] === null || body[field] === ""
  );

  if (missing.length > 0) {
    return NextResponse.json(
      {
        error:
          "Please rate all five categories on the sliders (Food, Service, Ambience, Value, Overall).",
      },
      { status: 400 }
    );
  }

  // Validate ratings are within 1..5
  for (const field of requiredFields) {
    const val = Number(body[field]);
    if (!Number.isInteger(val) || val < 1 || val > 5) {
      return NextResponse.json(
        {
          error: `Rating for ${String(field).charAt(0).toUpperCase() + String(field).slice(1)} must be an integer between 1 and 5.`,
        },
        { status: 400 }
      );
    }
  }

  if (!isGeminiConfigured()) {
    console.error("[ReviewFlow API] Gemini request failed: GEMINI_API_KEY is not configured.");
    return NextResponse.json(
      {
        error: "GEMINI_API_KEY is not configured in .env. Please configure GEMINI_API_KEY.",
        source: "error",
      },
      { status: 503 }
    );
  }

  try {
    console.log("[ReviewFlow API] Gemini review generation started");
    const review = await generateWithGemini(body as FeedbackData);
    console.log("[ReviewFlow API] Gemini review generation succeeded");

    return NextResponse.json({
      review,
      source: "Gemini",
      google_review_url: getGoogleReviewUrl(),
    });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[ReviewFlow API] Gemini request failed: ${errMessage}`);

    return NextResponse.json(
      {
        error: "Gemini couldn't generate the review. Please try again.",
        details: errMessage.slice(0, 180),
        source: "error",
        google_review_url: getGoogleReviewUrl(),
      },
      { status: 502 }
    );
  }
}
