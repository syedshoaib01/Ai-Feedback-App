import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DEFAULT_UI_RATINGS, UNRATED_DESCRIPTOR, RATING_DESCRIPTORS } from "@/lib/constants";
import { validateFeedbackPayload } from "@/lib/validation/feedback";
import { hapticFeedback } from "@/lib/utils";

describe("Initial Unanswered Rating UX & Haptics Audit", () => {
  let originalWindow: unknown;

  beforeEach(() => {
    originalWindow = global.window;
  });

  afterEach(() => {
    (global as unknown as { window: unknown }).window = originalWindow;
    vi.restoreAllMocks();
  });

  it("initializes all five questionnaire categories with null in DEFAULT_UI_RATINGS", () => {
    expect(DEFAULT_UI_RATINGS.food).toBeNull();
    expect(DEFAULT_UI_RATINGS.service).toBeNull();
    expect(DEFAULT_UI_RATINGS.ambience).toBeNull();
    expect(DEFAULT_UI_RATINGS.value).toBeNull();
    expect(DEFAULT_UI_RATINGS.overall).toBeNull();
  });

  it("provides a neutral UNRATED_DESCRIPTOR without positive bias", () => {
    expect(UNRATED_DESCRIPTOR.label).toBe("Choose a rating");
    expect(UNRATED_DESCRIPTOR.expression).toBe("—");
    expect(UNRATED_DESCRIPTOR.badgeBg).toContain("bg-muted");
    expect(UNRATED_DESCRIPTOR.badgeBorder).toContain("border-dashed");
  });

  it("maps distinct 1-5 ratings to their respective descriptors", () => {
    expect(RATING_DESCRIPTORS[1].label).toBe("Not good");
    expect(RATING_DESCRIPTORS[2].label).toBe("Could be better");
    expect(RATING_DESCRIPTORS[3].label).toBe("Pretty good");
    expect(RATING_DESCRIPTORS[4].label).toBe("Really good");
    expect(RATING_DESCRIPTORS[5].label).toBe("Loved it!");
  });

  it("backend strictly rejects unrated (null) categories without assuming rating 3", () => {
    const unratedState = {
      food: null,
      service: 4,
      ambience: 5,
      value: 4,
      overall: 5,
    };
    const validation = validateFeedbackPayload(unratedState);
    expect(validation.isValid).toBe(false);
    expect(validation.error).toContain("Please rate all five categories");
    expect(validation.data).toBeUndefined();
  });

  it("hapticFeedback safely handles browsers without navigator.vibrate (e.g. iOS Safari)", () => {
    // Simulate iOS Safari where window.navigator exists but vibrate is undefined
    (global as unknown as { window: unknown }).window = {
      navigator: {},
    };

    expect(() => hapticFeedback(12)).not.toThrow();
  });

  it("hapticFeedback respects prefers-reduced-motion media query", () => {
    const vibrateSpy = vi.fn();
    (global as unknown as { window: unknown }).window = {
      navigator: {
        vibrate: vibrateSpy,
      },
      matchMedia: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("prefers-reduced-motion"),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
      })),
    };

    hapticFeedback(12);
    expect(vibrateSpy).not.toHaveBeenCalled();
  });

  it("hapticFeedback invokes navigator.vibrate when supported and allowed", () => {
    const vibrateSpy = vi.fn();
    (global as unknown as { window: unknown }).window = {
      navigator: {
        vibrate: vibrateSpy,
      },
      matchMedia: vi.fn().mockImplementation(() => ({
        matches: false,
      })),
    };

    hapticFeedback(12);
    expect(vibrateSpy).toHaveBeenCalledWith(12);
  });
});
