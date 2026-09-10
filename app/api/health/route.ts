import { NextResponse } from "next/server";
import { isGeminiConfigured, getGoogleReviewUrl, getGeminiModel } from "@/lib/gemini/client";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      status: "healthy",
      gemini_configured: isGeminiConfigured(),
      google_review_configured: Boolean(getGoogleReviewUrl()),
      model: getGeminiModel(),
    },
    { status: 200 }
  );
}
