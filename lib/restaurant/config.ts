import { CategoryItem } from "@/types/feedback";
import { CATEGORIES, HIGHLIGHT_OPTIONS } from "@/lib/constants";
import { getGoogleReviewUrl } from "@/lib/gemini/client";

export interface RestaurantHighlight {
  id: string;
  label: string;
  icon: string;
}

export interface RestaurantToneConfig {
  defaultIntensity?: "low" | "medium" | "high";
  targetWords?: string;
  customGuidelines?: string;
}

export interface RestaurantConfig {
  slug: string;
  name: string;
  tagline?: string;
  logo?: string;
  googleReviewUrl: string;
  themeAccent?: string;
  highlights?: RestaurantHighlight[];
  categories?: CategoryItem[];
  toneConfig?: RestaurantToneConfig;
}

export const DEFAULT_RESTAURANT: RestaurantConfig = {
  slug: "default",
  name: "ReviewFlow",
  tagline: "Turn your genuine experience into an authentic review",
  googleReviewUrl: getGoogleReviewUrl(),
  highlights: HIGHLIGHT_OPTIONS,
  categories: CATEGORIES,
  toneConfig: {
    defaultIntensity: "medium",
    targetWords: "35-80",
  },
};

export const RESTAURANT_REGISTRY: Record<string, RestaurantConfig> = {
  "cafe-example": {
    slug: "cafe-example",
    name: "The Roastery Café",
    tagline: "Specialty coffee, house pastries & artisan brunch",
    googleReviewUrl: getGoogleReviewUrl() || "https://maps.google.com/?cid=123456789",
    themeAccent: "#d97706",
    highlights: [
      { id: "coffee", label: "Specialty Coffee", icon: "☕" },
      { id: "pastries", label: "Fresh Pastries", icon: "🥐" },
      { id: "vibe", label: "Cozy Patio Vibe", icon: "🌿" },
      { id: "barista", label: "Friendly Baristas", icon: "✨" },
      { id: "quick", label: "Fast Line", icon: "⚡" },
      { id: "workspace", label: "Good Work Seating", icon: "💻" },
    ],
    categories: CATEGORIES,
    toneConfig: {
      defaultIntensity: "medium",
      targetWords: "35-80",
    },
  },
  "bistro-verde": {
    slug: "bistro-verde",
    name: "Verde Artisan Bistro",
    tagline: "Farm-to-table dining, seasonal cocktails & wood-fired kitchen",
    googleReviewUrl: getGoogleReviewUrl() || "https://maps.google.com/?cid=987654321",
    themeAccent: "#059669",
    highlights: [
      { id: "food", label: "Wood-Fired Mains", icon: "🍕" },
      { id: "cocktails", label: "Craft Cocktails", icon: "🍸" },
      { id: "ambience", label: "Garden Ambience", icon: "🕯️" },
      { id: "service", label: "Attentive Staff", icon: "🌟" },
      { id: "dessert", label: "House Gelato", icon: "🍨" },
    ],
    categories: CATEGORIES,
    toneConfig: {
      defaultIntensity: "medium",
      targetWords: "35-80",
    },
  },
};

/**
 * Retrieves the venue configuration by slug.
 * If slug is omitted or not found in pre-configured registry, generates a clean fallback.
 */
export function getRestaurantConfig(slug?: string): RestaurantConfig {
  if (!slug) return DEFAULT_RESTAURANT;
  const normalized = slug.toLowerCase().trim();
  const found = RESTAURANT_REGISTRY[normalized];
  if (found) {
    return {
      ...found,
      googleReviewUrl: found.googleReviewUrl || getGoogleReviewUrl(),
    };
  }

  // Graceful fallback for dynamic venue slugs
  const formattedName = normalized
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    ...DEFAULT_RESTAURANT,
    slug: normalized,
    name: formattedName || "Restaurant",
    tagline: `Share your experience with ${formattedName}`,
  };
}
