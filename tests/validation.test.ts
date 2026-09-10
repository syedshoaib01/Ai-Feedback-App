import { describe, it, expect } from "vitest";
import { validateFeedbackPayload } from "@/lib/validation/feedback";

describe("Feedback Payload Validation", () => {
  it("rejects non-object payloads", () => {
    const result = validateFeedbackPayload("invalid string");
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Expected a JSON object");
    expect(result.data).toBeUndefined();
  });

  it("rejects null or array payloads", () => {
    expect(validateFeedbackPayload(null).isValid).toBe(false);
    expect(validateFeedbackPayload([]).isValid).toBe(false);
  });

  it("rejects payloads with missing required rating fields", () => {
    const incompletePayload = {
      food: 5,
      service: 4,
      // ambience, value, overall missing
    };
    const result = validateFeedbackPayload(incompletePayload);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Please rate all five categories");
  });

  it("rejects payloads where any rating is null and does not assume rating 3", () => {
    const nullPayload = {
      food: null,
      service: 5,
      ambience: 5,
      value: 5,
      overall: 5,
    };
    const result = validateFeedbackPayload(nullPayload);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Please rate all five categories");
    expect(result.data).toBeUndefined();
  });

  it("rejects ratings greater than 5", () => {
    const payload = {
      food: 6,
      service: 5,
      ambience: 5,
      value: 5,
      overall: 5,
    };
    const result = validateFeedbackPayload(payload);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Rating for Food & Drinks must be an integer between 1 and 5");
  });

  it("rejects ratings less than 1", () => {
    const payload = {
      food: 0,
      service: 5,
      ambience: 5,
      value: 5,
      overall: 5,
    };
    const result = validateFeedbackPayload(payload);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Rating for Food & Drinks must be an integer between 1 and 5");
  });

  it("rejects non-integer ratings", () => {
    const payload = {
      food: 4.5,
      service: 5,
      ambience: 5,
      value: 5,
      overall: 5,
    };
    const result = validateFeedbackPayload(payload);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("must be an integer between 1 and 5");
  });

  it("rejects non-numeric rating strings", () => {
    const payload = {
      food: "five",
      service: 5,
      ambience: 5,
      value: 5,
      overall: 5,
    };
    const result = validateFeedbackPayload(payload);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("must be an integer between 1 and 5");
  });

  it("accepts valid numeric string ratings and converts them cleanly", () => {
    const payload = {
      food: "5",
      service: "4",
      ambience: "3",
      value: "4",
      overall: "5",
      highlight: "Coffee",
      comment: "Best espresso around.",
    };
    const result = validateFeedbackPayload(payload);
    expect(result.isValid).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.food).toBe(5);
    expect(result.data?.service).toBe(4);
    expect(result.data?.ambience).toBe(3);
    expect(result.data?.value).toBe(4);
    expect(result.data?.overall).toBe(5);
    expect(result.data?.highlight).toBe("Coffee");
    expect(result.data?.comment).toBe("Best espresso around.");
    expect(result.data?.slang_intensity).toBe("medium");
  });

  it("caps highlight at 100 characters and comment at 500 characters", () => {
    const payload = {
      food: 5,
      service: 5,
      ambience: 5,
      value: 5,
      overall: 5,
      highlight: "H".repeat(150),
      comment: "C".repeat(600),
    };
    const result = validateFeedbackPayload(payload);
    expect(result.isValid).toBe(true);
    expect(result.data?.highlight?.length).toBe(100);
    expect(result.data?.comment?.length).toBe(500);
  });

  it("accepts custom slang_intensity parameter", () => {
    const payload = {
      food: 5,
      service: 5,
      ambience: 5,
      value: 5,
      overall: 5,
      slang_intensity: "high",
    };
    const result = validateFeedbackPayload(payload);
    expect(result.isValid).toBe(true);
    expect(result.data?.slang_intensity).toBe("high");
  });
});
