export type RatingValue = 1 | 2 | 3 | 4 | 5;

export type UiRatingValue = RatingValue | null;

export type SlangIntensity = "low" | "medium" | "high";

export interface FeedbackRatings {
  food: RatingValue;
  service: RatingValue;
  ambience: RatingValue;
  value: RatingValue;
  overall: RatingValue;
}

export type UiFeedbackRatings = {
  [K in keyof FeedbackRatings]: UiRatingValue;
};

export interface FeedbackData extends FeedbackRatings {
  highlight?: string;
  comment?: string;
  slang_intensity?: SlangIntensity;
}

export interface CategoryItem {
  id: keyof FeedbackRatings;
  title: string;
  question?: string;
  subtitle: string;
  icon: string;
}

export interface HighlightItem {
  id: string;
  label: string;
  icon: string;
}
