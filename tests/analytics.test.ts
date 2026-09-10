import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { trackEvent } from "@/lib/analytics/events";

describe("Analytics Event Boundaries & Privacy", () => {
  let originalWindow: unknown;

  beforeEach(() => {
    originalWindow = global.window;
  });

  afterEach(() => {
    global.window = originalWindow as typeof window;
    vi.restoreAllMocks();
  });

  it("handles SSR safely when window is undefined", () => {
    // @ts-expect-error - simulating node / SSR environment
    delete global.window;
    expect(() => trackEvent("rating_selected", { rating: 5 })).not.toThrow();
  });

  it("dispatches custom event without crashing when window is defined", () => {
    const dispatchSpy = vi.fn();
    class MockCustomEvent {
      type: string;
      detail: unknown;
      bubbles: boolean;
      constructor(type: string, init?: { detail: unknown; bubbles?: boolean }) {
        this.type = type;
        this.detail = init?.detail;
        this.bubbles = !!init?.bubbles;
      }
    }

    // @ts-expect-error - mock window for node environment
    global.window = {
      dispatchEvent: dispatchSpy,
    };
    // @ts-expect-error - mock CustomEvent
    global.CustomEvent = MockCustomEvent;

    trackEvent("rating_selected", {
      restaurantSlug: "cafe-example",
      category: "food",
      rating: 5,
    });

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    const event = dispatchSpy.mock.calls[0][0];
    expect(event.type).toBe("reviewflow:event");
    expect(event.detail.event).toBe("rating_selected");
    expect(event.detail.metadata.category).toBe("food");
    expect(event.detail.metadata.rating).toBe(5);
  });

  it("does not include customer review text in metadata", () => {
    const dispatchSpy = vi.fn();
    class MockCustomEvent {
      type: string;
      detail: unknown;
      bubbles: boolean;
      constructor(type: string, init?: { detail: unknown; bubbles?: boolean }) {
        this.type = type;
        this.detail = init?.detail;
        this.bubbles = !!init?.bubbles;
      }
    }

    // @ts-expect-error - mock window
    global.window = {
      dispatchEvent: dispatchSpy,
    };
    // @ts-expect-error - mock CustomEvent
    global.CustomEvent = MockCustomEvent;

    trackEvent("review_copied", {
      characterCount: 140,
    });

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    const event = dispatchSpy.mock.calls[0][0];
    expect(event.detail.metadata.characterCount).toBe(140);
    expect(event.detail.metadata.reviewText).toBeUndefined();
    expect(event.detail.metadata.comment).toBeUndefined();
  });
});
