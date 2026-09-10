export type RatingValue = 1 | 2 | 3 | 4 | 5;

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
}

export interface GenerateResponse {
  review: string;
  source: string;
  google_review_url: string;
}

export interface GenerateErrorResponse {
  error: string;
  details?: string;
  source?: string;
  google_review_url?: string;
}

export interface AppConfig {
  hasGeminiKey: boolean;
  googleReviewUrl: string;
  model: string;
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

export type Theme = "light" | "dark" | "system";
