import { CategoryItem, FeedbackRatings, HighlightItem, RatingValue, UiFeedbackRatings } from "./types";

export const UNRATED_DESCRIPTOR = {
  label: "Choose a rating",
  expression: "—",
  badgeBg: "bg-muted/40",
  badgeText: "text-muted-foreground",
  badgeBorder: "border-dashed border-border",
};

export const SCORE_LABELS: Record<RatingValue, string> = {
  1: "Very dissatisfied (1/5)",
  2: "Dissatisfied (2/5)",
  3: "Okay / Average (3/5)",
  4: "Satisfied / Good (4/5)",
  5: "Very satisfied / Excellent (5/5)",
};

export interface RatingDescriptor {
  value: RatingValue;
  label: string;
  expression: string;
  colorClass: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const RATING_DESCRIPTORS: Record<RatingValue, RatingDescriptor> = {
  1: {
    value: 1,
    label: "Not good",
    expression: "😞",
    colorClass: "text-rose-600 dark:text-rose-400",
    badgeBg: "bg-rose-50 dark:bg-rose-950/40",
    badgeText: "text-rose-700 dark:text-rose-300",
    badgeBorder: "border-rose-200 dark:border-rose-900/50",
  },
  2: {
    value: 2,
    label: "Could be better",
    expression: "😕",
    colorClass: "text-orange-600 dark:text-orange-400",
    badgeBg: "bg-orange-50 dark:bg-orange-950/40",
    badgeText: "text-orange-700 dark:text-orange-300",
    badgeBorder: "border-orange-200 dark:border-orange-900/50",
  },
  3: {
    value: 3,
    label: "Pretty good",
    expression: "🙂",
    colorClass: "text-amber-600 dark:text-amber-400",
    badgeBg: "bg-amber-50 dark:bg-amber-950/40",
    badgeText: "text-amber-700 dark:text-amber-300",
    badgeBorder: "border-amber-200 dark:border-amber-900/50",
  },
  4: {
    value: 4,
    label: "Really good",
    expression: "😊",
    colorClass: "text-lime-600 dark:text-lime-400",
    badgeBg: "bg-lime-50 dark:bg-lime-950/40",
    badgeText: "text-lime-800 dark:text-lime-300",
    badgeBorder: "border-lime-200 dark:border-lime-900/50",
  },
  5: {
    value: 5,
    label: "Loved it!",
    expression: "✨",
    colorClass: "text-emerald-600 dark:text-emerald-400",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/40",
    badgeText: "text-emerald-800 dark:text-emerald-300",
    badgeBorder: "border-emerald-200 dark:border-emerald-900/50",
  },
};

export const CATEGORIES: CategoryItem[] = [
  {
    id: "food",
    title: "Food & Drinks",
    question: "How was the food & drinks?",
    subtitle: "Taste, temperature, presentation, and drink quality",
    icon: "☕",
  },
  {
    id: "service",
    title: "Service",
    question: "How was the service?",
    subtitle: "Friendliness, speed, and care from the team",
    icon: "🤝",
  },
  {
    id: "ambience",
    title: "Ambience",
    question: "How was the vibe & atmosphere?",
    subtitle: "Music, lighting, interior comfort, and general feel",
    icon: "✨",
  },
  {
    id: "value",
    title: "Value for Money",
    question: "How was the value for money?",
    subtitle: "Did the portions and experience match the bill?",
    icon: "💰",
  },
  {
    id: "overall",
    title: "Overall Experience",
    question: "How was your overall visit?",
    subtitle: "Big picture — would you recommend or come back?",
    icon: "⭐",
  },
];

export const HIGHLIGHT_OPTIONS: HighlightItem[] = [
  { id: "Coffee", label: "Coffee", icon: "☕" },
  { id: "Food", label: "Food", icon: "🥐" },
  { id: "Dessert", label: "Dessert", icon: "🍰" },
  { id: "Atmosphere", label: "Atmosphere", icon: "✨" },
  { id: "Service", label: "Staff", icon: "🤝" },
  { id: "Value", label: "Value", icon: "💰" },
  { id: "Seating", label: "Seating", icon: "🪑" },
  { id: "Nothing specific", label: "Nothing specific", icon: "💫" },
];

export const SLANG_STYLE_GUIDES = [
  "Style: Casual & natural conversational tone. Clean and simple with zero to one slang expression.",
  "Style: Light Gen Z / contemporary casual voice. Use 1-2 natural terms like 'vibes', 'pretty solid', 'actually', or 'super'.",
  "Style: Internet-native casual voice. Spontaneous and authentic using 2-3 phrases like 'fire', 'lowkey', 'worth it', or 'immaculate' where fitting.",
  "Style: Relaxed conversational tone. Focus on effortless phrasing, varied rhythm, and casual sincerity.",
];

export const DEFAULT_UI_RATINGS: UiFeedbackRatings = {
  food: null,
  service: null,
  ambience: null,
  value: null,
  overall: null,
};

export const DEFAULT_RATINGS: FeedbackRatings = {
  food: 5,
  service: 5,
  ambience: 5,
  value: 4,
  overall: 5,
};
