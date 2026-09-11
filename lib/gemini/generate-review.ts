import { FeedbackData } from "@/types/feedback";
import { getGeminiClient, getGeminiModel, redactSensitiveData } from "./client";
import { buildReviewPrompt } from "./prompt";

export class GeminiGenerationError extends Error {
  statusCode: number;
  originalMessage?: string;

  constructor(message: string, statusCode = 502, originalMessage?: string) {
    super(message);
    this.name = "GeminiGenerationError";
    this.statusCode = statusCode;
    this.originalMessage = originalMessage;
  }
}

function cleanReviewText(rawText: string): string {
  let cleaned = (rawText || "").trim();

  // Strip accidental markdown code blocks
  if (cleaned.startsWith("```") && cleaned.endsWith("```")) {
    cleaned = cleaned.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/, "").trim();
  }

  // Strip conversational preambles
  const preamblePatterns = [
    /^here('s| is) (a|your|the) (review|draft)(:|\.)?\s*/i,
    /^google review draft(:|\.)?\s*/i,
    /^(my|customer) review(:|\.)?\s*/i,
  ];
  for (const pattern of preamblePatterns) {
    cleaned = cleaned.replace(pattern, "").trim();
  }

  // Strip wrapping quotation marks
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'")) ||
    (cleaned.startsWith("“") && cleaned.endsWith("”"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  return cleaned;
}

const FALLBACK_MODEL = "gemini-3.5-flash";

export interface ReviewGenerationResult {
  review: string;
  model: string;
  isFallback: boolean;
  attempts: number;
}

export async function generateReviewDetailed(data: FeedbackData): Promise<ReviewGenerationResult> {
  const client = getGeminiClient();
  const primaryModel = getGeminiModel();
  const { systemInstruction, prompt } = buildReviewPrompt(data);

  let lastError: unknown = null;
  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const isFallback = attempt > 1;
    const currentModel =
      attempt === 1
        ? primaryModel
        : primaryModel === FALLBACK_MODEL
        ? "gemini-3.7-flash"
        : FALLBACK_MODEL;

    try {
      if (attempt > 1) {
        console.warn(
          `[ReviewFlow] Retrying review generation using fallback model: ${currentModel}`
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      const response = await client.models.generateContent({
        model: currentModel,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.75,
        },
      });

      const rawText = response.text || "";
      const reviewText = cleanReviewText(rawText);

      if (!reviewText) {
        throw new Error("Gemini returned an empty review draft.");
      }

      return {
        review: reviewText,
        model: currentModel,
        isFallback,
        attempts: attempt,
      };
    } catch (err: unknown) {
      lastError = err;
      const rawMsg = err instanceof Error ? err.message : String(err);
      const safeMsg = redactSensitiveData(rawMsg);
      console.warn(
        `[ReviewFlow] Gemini attempt ${attempt} using ${currentModel} failed: ${safeMsg}`
      );

      // If rate limited or quota exceeded, detect early
      if (
        safeMsg.includes("429") ||
        safeMsg.toLowerCase().includes("quota") ||
        safeMsg.toLowerCase().includes("resource_exhausted")
      ) {
        throw new GeminiGenerationError(
          "AI review service is temporarily busy. Please wait a few moments and try again.",
          429,
          safeMsg
        );
      }
    }
  }

  const rawErrMsg = lastError instanceof Error ? lastError.message : String(lastError);
  const sanitizedMsg = redactSensitiveData(rawErrMsg);

  throw new GeminiGenerationError(
    "Gemini couldn't generate the review. Please try again.",
    502,
    sanitizedMsg.slice(0, 180)
  );
}

export async function generateReviewWithGemini(data: FeedbackData): Promise<string> {
  const result = await generateReviewDetailed(data);
  return result.review;
}
