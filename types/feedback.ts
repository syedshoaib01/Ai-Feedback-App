export type RatingValue = 1 | 2 | 3 | 4 | 5;

export type SlangIntensity = "low" | "medium" | "high";

export interface FeedbackRatings {
  food: RatingValue;
  service: RatingValue;
  ambience: RatingValue;
  value: RatingValue;
  overall: RatingValue;
}

export interface FeedbackData extends FeedbackRatings {
  highlight?: string;
  comment?: string;
  slang_intensity?: SlangIntensity;
}

export interface CategoryItem {
  id: keyof FeedbackRatings;
  title: string;
  subtitle: string;
  icon: string;
}

export interface HighlightItem {
  id: string;
  label: string;
  icon: string;
}
