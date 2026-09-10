import { GoogleGenAI } from "@google/genai";
import { FeedbackData } from "./types";
import { SCORE_LABELS, SLANG_STYLE_GUIDES } from "./constants";
import { sanitizeErrorMessage } from "./utils";

const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || "").trim();
const GEMINI_MODEL = (process.env.GEMINI_MODEL || "gemini-3.5-flash").trim();
const GOOGLE_REVIEW_URL = (process.env.GOOGLE_REVIEW_URL || "").trim();
const FLASK_API_URL = (process.env.FLASK_API_URL || "").trim();
const USE_FLASK_BACKEND = process.env.USE_FLASK_BACKEND === "true";

export function isGeminiConfigured(): boolean {
  return Boolean(GEMINI_API_KEY || (USE_FLASK_BACKEND && FLASK_API_URL));
}

export function getGoogleReviewUrl(): string {
  return GOOGLE_REVIEW_URL;
}

export function getGeminiModel(): string {
  return GEMINI_MODEL;
}

export async function generateWithGemini(data: FeedbackData): Promise<string> {
  // If explicitly configured to proxy to Flask backend
  if (USE_FLASK_BACKEND && FLASK_API_URL) {
    const flaskRes = await fetch(`${FLASK_API_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const flaskJson = await flaskRes.json();
    if (!flaskRes.ok) {
      throw new Error(flaskJson.error || "Flask backend returned an error.");
    }
    return flaskJson.review;
  }

  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }

  const foodScore = Number(data.food) || 5;
  const serviceScore = Number(data.service) || 5;
  const ambienceScore = Number(data.ambience) || 5;
  const valueScore = Number(data.value) || 5;
  const overallScore = Number(data.overall) || 5;
  const highlight = (data.highlight || "").trim();
  const comment = (data.comment || "").trim();

  // Random style guide variation for natural cadence
  const randomIndex = Math.floor(Math.random() * SLANG_STYLE_GUIDES.length);
  const styleVariation = SLANG_STYLE_GUIDES[randomIndex];

  const prompt = `You are drafting a real customer's review for a cafe or restaurant based strictly on their actual feedback ratings and notes.

Target Voice:
- First-person perspective ("I", "my").
- Casual, authentic Gen Z / internet-native conversational style (like someone casually typing a Google Maps review on their phone or telling a friend).
- ${styleVariation}
- Words that can be used naturally if they fit the sentiment: "vibe", "vibes", "pretty solid", "kinda", "super", "actually", "honestly", "worth it", "chill", "fire", "a lil", "lowkey", "loved this".
- NEVER force slang. Naturalness and authenticity ALWAYS trump slang. Do not create a parody or caricature of Gen Z speech.
- Vary your opening sentences. Do NOT predictably begin with "Lowkey...", "Ngl...", "Honestly...", or "I really enjoyed...".

Strict Rules:
1. FACTUAL GROUNDING: Rely ONLY on the customer's provided ratings, highlight, and comments. NEVER invent specific food/drink items, staff names, prices, wait times, locations, or experiences that the customer did not mention.
2. SENTIMENT FIDELITY: Accurately reflect the customer's sentiment.
   - If they gave high scores (4-5), keep it positive and enthusiastic.
   - If feedback is mixed (e.g. food 5, service 2), reflect both the good food and the slow/poor service honestly without sugarcoating or turning it positive.
   - If scores are low (1-2), keep the review genuinely critical and dissatisfied.
3. CUSTOMER COMMENT INTEGRATION: If the customer left a specific comment, integrate their exact points and let their wording naturally guide the tone.
4. LENGTH: Keep it between 35 and 80 words.
5. FORMATTING: Output plain review text ONLY. No quotation marks around the review. No intro or outro text. No hashtags. No emojis unless the customer included emojis in their comment.

Customer Feedback:
- Food & Drinks: ${SCORE_LABELS[foodScore as keyof typeof SCORE_LABELS] || `${foodScore}/5`}
- Service: ${SCORE_LABELS[serviceScore as keyof typeof SCORE_LABELS] || `${serviceScore}/5`}
- Ambience: ${SCORE_LABELS[ambienceScore as keyof typeof SCORE_LABELS] || `${ambienceScore}/5`}
- Value for Money: ${SCORE_LABELS[valueScore as keyof typeof SCORE_LABELS] || `${valueScore}/5`}
- Overall Experience: ${SCORE_LABELS[overallScore as keyof typeof SCORE_LABELS] || `${overallScore}/5`}
- Highlight of the visit: ${highlight ? highlight : "None specified"}
- Customer's own words: ${comment ? comment : "None provided"}
`;

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  let lastError: unknown = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
      });

      let reviewText = (response.text || "").trim();

      // Strip accidental wrapping quotes if the model returned them
      if (
        (reviewText.startsWith('"') && reviewText.endsWith('"')) ||
        (reviewText.startsWith("'") && reviewText.endsWith("'"))
      ) {
        reviewText = reviewText.slice(1, -1).trim();
      }

      if (!reviewText) {
        throw new Error("Gemini returned an empty review draft.");
      }

      return reviewText;
    } catch (error) {
      lastError = error;
      console.warn(`[ReviewFlow] Gemini attempt ${attempt + 1} failed:`, error instanceof Error ? error.message : error);
    }
  }

  const sanitized = sanitizeErrorMessage(lastError, GEMINI_API_KEY);
  throw new Error(sanitized);
}
