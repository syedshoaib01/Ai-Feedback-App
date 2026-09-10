import { NextResponse } from "next/server";
import { getGeminiModel, getGoogleReviewUrl, isGeminiConfigured } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    hasGeminiKey: isGeminiConfigured(),
    googleReviewUrl: getGoogleReviewUrl(),
    model: getGeminiModel(),
  });
}
