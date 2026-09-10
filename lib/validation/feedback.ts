import { z } from "zod";
import { FeedbackData, RatingValue, SlangIntensity } from "@/types/feedback";

const FIELD_LABELS: Record<string, string> = {
  food: "Food & Drinks",
  service: "Service",
  ambience: "Ambience",
  value: "Value for Money",
  overall: "Overall Experience",
};

const ratingSchema = z.preprocess(
  (val) => {
    if (typeof val === "string") {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? val : parsed;
    }
    return val;
  },
  z
    .number({
      error: "Rating must be an integer between 1 and 5.",
    })
    .int("Rating must be an integer between 1 and 5.")
    .min(1, "Rating must be an integer between 1 and 5.")
    .max(5, "Rating must be an integer between 1 and 5.")
);

export const FeedbackPayloadSchema = z.object({
  food: ratingSchema,
  service: ratingSchema,
  ambience: ratingSchema,
  value: ratingSchema,
  overall: ratingSchema,
  highlight: z
    .string()
    .nullish()
    .transform((val) => (val || "").trim().slice(0, 100)),
  comment: z
    .string()
    .nullish()
    .transform((val) => (val || "").trim().slice(0, 500)),
  slang_intensity: z
    .enum(["low", "medium", "high"])
    .optional()
    .default("medium"),
});

export type ValidatedFeedbackData = z.infer<typeof FeedbackPayloadSchema>;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  data?: FeedbackData;
}

export function validateFeedbackPayload(payload: unknown): ValidationResult {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return {
      isValid: false,
      error: "Invalid request body. Expected a JSON object.",
    };
  }

  const raw = payload as Record<string, unknown>;
  const requiredFields = ["food", "service", "ambience", "value", "overall"] as const;

  const missing = requiredFields.filter(
    (field) => raw[field] === undefined || raw[field] === null || raw[field] === ""
  );

  if (missing.length > 0) {
    return {
      isValid: false,
      error: "Please rate all five categories on the sliders (Food, Service, Ambience, Value, Overall).",
    };
  }

  for (const field of requiredFields) {
    const rawVal = raw[field];
    const num = typeof rawVal === "string" ? parseInt(rawVal, 10) : Number(rawVal);
    const displayLabel = FIELD_LABELS[field] || field;

    if (isNaN(num) || !Number.isInteger(num) || num < 1 || num > 5) {
      return {
        isValid: false,
        error: `Rating for ${displayLabel} must be an integer between 1 and 5.`,
      };
    }
  }

  const parsed = FeedbackPayloadSchema.safeParse(raw);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      isValid: false,
      error: firstIssue?.message || "Invalid feedback payload.",
    };
  }

  const validData = parsed.data;

  return {
    isValid: true,
    data: {
      food: validData.food as RatingValue,
      service: validData.service as RatingValue,
      ambience: validData.ambience as RatingValue,
      value: validData.value as RatingValue,
      overall: validData.overall as RatingValue,
      highlight: validData.highlight || "",
      comment: validData.comment || "",
      slang_intensity: (validData.slang_intensity || "medium") as SlangIntensity,
    },
  };
}
