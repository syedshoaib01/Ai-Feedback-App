export interface GenerateResponse {
  review: string;
  source: string;
  google_review_url: string;
  model?: string;
  is_fallback?: boolean;
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
