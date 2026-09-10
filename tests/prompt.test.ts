import { describe, it, expect } from "vitest";
import { buildReviewPrompt } from "@/lib/gemini/prompt";
import { FeedbackData } from "@/types/feedback";

describe("Prompt Builder & Sentiment Calibration", () => {
  it("generates high positive sentiment directives for high scores", () => {
    const highPositiveData: FeedbackData = {
      food: 5,
      service: 5,
      ambience: 5,
      value: 4,
      overall: 5,
      highlight: "Coffee",
      comment: "Best oat latte ever.",
      slang_intensity: "medium",
    };

    const { systemInstruction, prompt } = buildReviewPrompt(highPositiveData);

    expect(prompt).toContain("HIGH POSITIVE SENTIMENT");
    expect(prompt).toContain("Food & Drinks: Very satisfied / Excellent (5/5)");
    expect(prompt).toContain("Best oat latte ever.");
    expect(prompt).toContain("Coffee");
    expect(systemInstruction).toContain("STRICT FACTUAL GROUNDING");
    expect(systemInstruction).toContain("NEVER invent specific menu items");
    expect(systemInstruction).toContain("NO EMOJIS");
  });

  it("generates mixed sentiment directives for mixed scores", () => {
    const mixedData: FeedbackData = {
      food: 4,
      service: 3,
      ambience: 5,
      value: 2,
      overall: 3,
      highlight: "Atmosphere",
      comment: "Super pretty space but service took 30 mins.",
      slang_intensity: "medium",
    };

    const { prompt } = buildReviewPrompt(mixedData);

    expect(prompt).toContain("MIXED SENTIMENT");
    expect(prompt).toContain("MUST mention both the positive and the negative sides honestly");
    expect(prompt).toContain("Atmosphere");
    expect(prompt).toContain("Super pretty space but service took 30 mins.");
  });

  it("generates critical/negative sentiment directives for low scores", () => {
    const negativeData: FeedbackData = {
      food: 2,
      service: 2,
      ambience: 3,
      value: 2,
      overall: 2,
      comment: "Cold food and rushed staff.",
      slang_intensity: "medium",
    };

    const { prompt } = buildReviewPrompt(negativeData);

    expect(prompt).toContain("CRITICAL/NEGATIVE SENTIMENT");
    expect(prompt).toContain("DO NOT sugarcoat");
    expect(prompt).toContain("Cold food and rushed staff.");
  });

  it("configures LOW slang intensity properly", () => {
    const data: FeedbackData = {
      food: 4,
      service: 4,
      ambience: 4,
      value: 4,
      overall: 4,
      slang_intensity: "low",
    };

    const { prompt } = buildReviewPrompt(data);
    expect(prompt).toContain("SLANG INTENSITY: LOW");
    expect(prompt).toContain("Avoid internet shorthand like \"ngl\", \"lowkey\"");
  });

  it("configures HIGH slang intensity with anti-caricature guardrails", () => {
    const data: FeedbackData = {
      food: 5,
      service: 5,
      ambience: 5,
      value: 5,
      overall: 5,
      slang_intensity: "high",
    };

    const { prompt } = buildReviewPrompt(data);
    expect(prompt).toContain("SLANG INTENSITY: HIGH");
    expect(prompt).toContain("CRITICAL RULE: NEVER stack multiple slang terms");
  });

  it("enforces word length and output formatting constraints", () => {
    const data: FeedbackData = {
      food: 5,
      service: 5,
      ambience: 5,
      value: 5,
      overall: 5,
    };

    const { systemInstruction, prompt } = buildReviewPrompt(data);
    expect(systemInstruction).toContain("40 to 90 words");
    expect(systemInstruction).toContain("2 to 5 sentences");
    expect(systemInstruction).toContain("Output plain review text ONLY");
    expect(prompt).toContain("Voice Calibration Examples");
  });
});
