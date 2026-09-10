"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { FeedbackData, FeedbackRatings, RatingValue, UiFeedbackRatings } from "@/lib/types";
import { CATEGORIES, DEFAULT_UI_RATINGS } from "@/lib/constants";
import { generateReview, fetchAppConfig, ApiError } from "@/lib/api";
import { trackEvent } from "@/lib/analytics/events";
import { RestaurantConfig } from "@/lib/restaurant/config";

export type FlowView = "questionnaire" | "generating" | "result";

export interface UseFeedbackFlowOptions {
  restaurantConfig?: RestaurantConfig;
}

export function useFeedbackFlow(options: UseFeedbackFlowOptions = {}) {
  const { restaurantConfig } = options;
  const restaurantSlug = restaurantConfig?.slug;

  const [ratings, setRatings] = useState<UiFeedbackRatings>(DEFAULT_UI_RATINGS);
  const [highlight, setHighlight] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [view, setView] = useState<FlowView>("questionnaire");
  const [isAllQuestionsMode, setIsAllQuestionsMode] = useState<boolean>(false);

  const [generatedReview, setGeneratedReview] = useState<string>("");
  const [googleReviewUrl, setGoogleReviewUrl] = useState<string>(
    restaurantConfig?.googleReviewUrl || ""
  );
  const [error, setError] = useState<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Initialize config (Google Review URL) if not provided by venue config
  useEffect(() => {
    if (restaurantConfig?.googleReviewUrl) {
      setGoogleReviewUrl(restaurantConfig.googleReviewUrl);
      return;
    }

    let isMounted = true;
    fetchAppConfig().then((config) => {
      if (isMounted && config.googleReviewUrl) {
        setGoogleReviewUrl(config.googleReviewUrl);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [restaurantConfig?.googleReviewUrl]);

  // Track initial step viewed
  useEffect(() => {
    trackEvent("question_viewed", {
      restaurantSlug,
      stepIndex: 1,
    });
  }, [restaurantSlug]);

  const setRating = useCallback(
    (field: keyof FeedbackRatings, value: RatingValue) => {
      setError(null);
      setRatings((prev) => ({ ...prev, [field]: value }));
      trackEvent("rating_selected", {
        restaurantSlug,
        category: field,
        rating: value,
      });
    },
    [restaurantSlug]
  );

  const toggleHighlight = useCallback((id: string) => {
    setError(null);
    setHighlight((prev) => (prev === id ? "" : id));
  }, []);

  const nextStep = useCallback(() => {
    setError(null);
    setCurrentStep((prev) => {
      const next = Math.min(prev + 1, 6);
      trackEvent("question_viewed", {
        restaurantSlug,
        stepIndex: next,
      });
      return next;
    });
  }, [restaurantSlug]);

  const prevStep = useCallback(() => {
    setError(null);
    setCurrentStep((prev) => {
      const p = Math.max(prev - 1, 1);
      trackEvent("question_viewed", {
        restaurantSlug,
        stepIndex: p,
      });
      return p;
    });
  }, [restaurantSlug]);

  const goToStep = useCallback(
    (step: number) => {
      setError(null);
      const target = Math.min(Math.max(step, 1), 6);
      setCurrentStep(target);
      trackEvent("question_viewed", {
        restaurantSlug,
        stepIndex: target,
      });
    },
    [restaurantSlug]
  );

  const isAllRatingsAnswered = (Object.values(ratings) as (RatingValue | null)[]).every(
    (r) => r !== null
  );

  const submitFeedback = useCallback(async () => {
    if (view === "generating") return;

    // Guard: ensure all 5 rating categories have been answered
    const categories = restaurantConfig?.categories || CATEGORIES;
    const unanswered = categories.find((cat) => ratings[cat.id] === null);
    if (unanswered) {
      setError(`Please rate ${unanswered.title} before drafting your review.`);
      const stepIdx = categories.findIndex((cat) => cat.id === unanswered.id) + 1;
      if (stepIdx > 0 && !isAllQuestionsMode) {
        setCurrentStep(stepIdx);
      }
      return;
    }

    setError(null);
    setView("generating");

    const payload: FeedbackData = {
      food: ratings.food as RatingValue,
      service: ratings.service as RatingValue,
      ambience: ratings.ambience as RatingValue,
      value: ratings.value as RatingValue,
      overall: ratings.overall as RatingValue,
      highlight,
      comment,
      slang_intensity: restaurantConfig?.toneConfig?.defaultIntensity || "medium",
    };

    const timeSpentMs = Date.now() - startTimeRef.current;
    trackEvent("feedback_completed", {
      restaurantSlug,
      hasComment: Boolean(comment.trim()),
      commentLength: comment.length,
      timeSpentMs,
    });
    trackEvent("generation_started", {
      restaurantSlug,
    });

    try {
      const result = await generateReview(payload);
      setGeneratedReview(result.review);
      if (result.google_review_url && !googleReviewUrl) {
        setGoogleReviewUrl(result.google_review_url);
      }
      setView("result");
      trackEvent("generation_success", {
        restaurantSlug,
        source: result.source,
      });
    } catch (err) {
      setView("questionnaire");
      // Go to highlights step so user can see error and retry
      setCurrentStep(6);
      trackEvent("generation_failed", {
        restaurantSlug,
        errorCode: err instanceof ApiError ? err.statusCode : undefined,
      });

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to generate review. Please try again.");
      }
    }
  }, [view, ratings, highlight, comment, restaurantConfig, restaurantSlug, googleReviewUrl, isAllQuestionsMode]);

  const editAnswers = useCallback(() => {
    setError(null);
    setView("questionnaire");
    setCurrentStep(1);
  }, []);

  return {
    ratings,
    setRating,
    isAllRatingsAnswered,
    highlight,
    toggleHighlight,
    comment,
    setComment,
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    totalSteps: 6,
    view,
    isAllQuestionsMode,
    setIsAllQuestionsMode,
    generatedReview,
    setGeneratedReview,
    googleReviewUrl,
    error,
    clearError: () => setError(null),
    submitFeedback,
    editAnswers,
  };
}
