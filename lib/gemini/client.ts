import { GoogleGenAI } from "@google/genai";

export function getGeminiApiKey(): string {
  return (process.env.GEMINI_API_KEY || "").trim();
}

export function getGeminiModel(): string {
  return (process.env.GEMINI_MODEL || "gemini-3.8-flash").trim();
}

export function getGoogleReviewUrl(): string {
  return (process.env.GOOGLE_REVIEW_URL || "").trim();
}

export function isGeminiConfigured(): boolean {
  return Boolean(getGeminiApiKey());
}

let cachedClient: GoogleGenAI | null = null;
let cachedKey: string | null = null;

export function getGeminiClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }

  if (cachedClient && cachedKey === apiKey) {
    return cachedClient;
  }

  cachedClient = new GoogleGenAI({ apiKey });
  cachedKey = apiKey;
  return cachedClient;
}

export function redactSensitiveData(text: string): string {
  const apiKey = getGeminiApiKey();
  let sanitized = text || "";
  if (apiKey && apiKey.length > 5 && sanitized.includes(apiKey)) {
    sanitized = sanitized.replaceAll(apiKey, "[REDACTED_API_KEY]");
  }
  return sanitized;
}
