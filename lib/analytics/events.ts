/**
 * Analytics Event Boundaries for ReviewFlow
 *
 * Privacy-First Architecture:
 * - NO personally identifiable information (PII) collected (no names, emails, phones, IPs).
 * - NO raw customer review drafts or comments stored or logged.
 * - Non-blocking event dispatcher for client-side telemetry.
 */

export type AnalyticsEventName =
  | "question_viewed"
  | "rating_selected"
  | "feedback_completed"
  | "generation_started"
  | "generation_success"
  | "generation_failed"
  | "review_edited"
  | "review_copied"
  | "google_cta_clicked";

export interface AnalyticsEventMetadata {
  restaurantSlug?: string;
  stepIndex?: number;
  category?: string;
  rating?: number;
  highlightId?: string;
  hasComment?: boolean;
  commentLength?: number;
  timeSpentMs?: number;
  source?: string;
  errorCode?: string | number;
  [key: string]: string | number | boolean | undefined;
}

export interface AnalyticsEvent {
  event: AnalyticsEventName;
  timestamp: number;
  metadata?: AnalyticsEventMetadata;
}

export function trackEvent(name: AnalyticsEventName, metadata?: AnalyticsEventMetadata): void {
  if (typeof window === "undefined") return;

  const eventPayload: AnalyticsEvent = {
    event: name,
    timestamp: Date.now(),
    metadata,
  };

  try {
    // 1. Dispatch custom DOM event for lightweight in-app or third-party listeners
    const customEvent = new CustomEvent("reviewflow:event", {
      detail: eventPayload,
      bubbles: true,
    });
    window.dispatchEvent(customEvent);

    // 2. Integration hook for Google Analytics / Tag Manager if present
    if (typeof (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag === "function") {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", name, metadata);
    }

    // 3. Optional debug log in development
    if (process.env.NODE_ENV === "development") {
      console.debug(`[Analytics] ${name}:`, metadata);
    }
  } catch {
    // Analytics failures must never break user flow
  }
}
