import { FeedbackData } from "@/types/feedback";
import {
  getGeminiApiKey,
  getGeminiModel,
  getGoogleReviewUrl,
  isGeminiConfigured,
} from "./gemini/client";
import { generateReviewWithGemini } from "./gemini/generate-review";

export { getGeminiApiKey, getGeminiModel, getGoogleReviewUrl, isGeminiConfigured };

export async function generateWithGemini(data: FeedbackData): Promise<string> {
  return generateReviewWithGemini(data);
}
