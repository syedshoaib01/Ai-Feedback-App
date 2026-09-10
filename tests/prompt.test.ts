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

    expect(prompt).toContain("SENTIMENT: HIGHLY ENTHUSIASTIC (5/5)");
    expect(prompt).toContain("Food & Drinks: Very satisfied / Excellent (5/5)");
    expect(prompt).toContain("Best oat latte ever.");
    expect(prompt).toContain("Coffee");
    expect(systemInstruction).toContain("STRICT FACTUAL GROUNDING");
    expect(systemInstruction).toContain("NEVER invent dishes, beverages");
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

    expect(prompt).toContain("SENTIMENT: MIXED / BALANCED");
    expect(prompt).toContain("The customer experienced clear pros and cons");
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

    expect(prompt).toContain("SENTIMENT: CRITICAL / DISSATISFIED");
    expect(prompt).toContain("DO NOT sugarcoat");
    expect(prompt).toContain("Cold food and rushed staff.");
  });

  it("configures subtle/clean slang intensity properly", () => {
    const data: FeedbackData = {
      food: 4,
      service: 4,
      ambience: 4,
      value: 4,
      overall: 4,
      slang_intensity: "low",
    };

    const { prompt } = buildReviewPrompt(data);
    expect(prompt).toContain("SLANG LEVEL: SUBTLE / CLEAN CONVERSATIONAL");
    expect(prompt).toContain("DO NOT use internet acronyms or slang");
  });

  it("configures internet-native slang intensity with anti-caricature guardrails", () => {
    const data: FeedbackData = {
      food: 5,
      service: 5,
      ambience: 5,
      value: 5,
      overall: 5,
      slang_intensity: "high",
    };

    const { prompt } = buildReviewPrompt(data);
    expect(prompt).toContain("SLANG LEVEL: INTERNET-NATIVE");
    expect(prompt).toContain("Never stack multiple slang words in one sentence");
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
    expect(systemInstruction).toContain("35 to 80 words");
    expect(systemInstruction).toContain("2 to 5 sentences");
    expect(systemInstruction).toContain("Plain review text ONLY");
    expect(prompt).toContain("SENTENCE RHYTHM EXAMPLES (CALIBRATION)");
  });

  it("mirrors customer voice when customer notes include casual phrasing", () => {
    const data: FeedbackData = {
      food: 5,
      service: 4,
      ambience: 5,
      value: 4,
      overall: 5,
      comment: "iced matcha was lowkey crazy good ngl",
    };

    const { prompt } = buildReviewPrompt(data);
    expect(prompt).toContain("SLANG LEVEL: MATCH CUSTOMER VOICE");
    expect(prompt).toContain("The customer used casual internet phrasing in their note. Mirror that casualness naturally!");
  });
});
