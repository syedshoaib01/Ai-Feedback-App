import { AppConfig, FeedbackData, GenerateErrorResponse, GenerateResponse } from "./types";

export class ApiError extends Error {
  details?: string;
  source?: string;
  statusCode: number;

  constructor(message: string, statusCode = 500, details?: string, source?: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
    this.source = source;
  }
}

export async function fetchAppConfig(): Promise<AppConfig> {
  try {
    const res = await fetch("/api/config", {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch configuration");
    }

    return await res.json();
  } catch (error) {
    // Fallback safe config
    return {
      hasGeminiKey: true,
      googleReviewUrl: "",
      model: "gemini-2.5-flash",
    };
  }
}

export async function generateReview(data: FeedbackData): Promise<GenerateResponse> {
  let response: Response;

  try {
    response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch (networkErr) {
    throw new ApiError(
      "Unable to connect to the server. Please check your connection and try again.",
      0,
      networkErr instanceof Error ? networkErr.message : "Network error"
    );
  }

  let result: (GenerateResponse & GenerateErrorResponse) | null = null;
  try {
    result = await response.json();
  } catch {
    throw new ApiError(
      "Received an invalid response from the review server.",
      response.status
    );
  }

  if (!response.ok || !result?.review) {
    const errorMsg = result?.error || "Failed to generate review. Please try again.";
    throw new ApiError(
      errorMsg,
      response.status,
      result?.details,
      result?.source || "error"
    );
  }

  return {
    review: result.review,
    source: result.source || "Gemini",
    google_review_url: result.google_review_url || "",
  };
}
