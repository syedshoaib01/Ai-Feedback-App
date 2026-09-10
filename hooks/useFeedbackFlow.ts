"use client";

import { useState, useCallback, useEffect } from "react";
import { FeedbackData, FeedbackRatings, RatingValue } from "@/lib/types";
import { DEFAULT_RATINGS } from "@/lib/constants";
import { generateReview, fetchAppConfig } from "@/lib/api";

export type FlowView = "questionnaire" | "generating" | "result";

export function useFeedbackFlow() {
  const [ratings, setRatings] = useState<FeedbackRatings>(DEFAULT_RATINGS);
  const [highlight, setHighlight] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [view, setView] = useState<FlowView>("questionnaire");
  const [isAllQuestionsMode, setIsAllQuestionsMode] = useState<boolean>(false);

  const [generatedReview, setGeneratedReview] = useState<string>("");
  const [googleReviewUrl, setGoogleReviewUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Initialize config (Google Review URL)
  useEffect(() => {
    fetchAppConfig().then((config) => {
      if (config.googleReviewUrl) {
        setGoogleReviewUrl(config.googleReviewUrl);
      }
    });
  }, []);

  const setRating = useCallback((field: keyof FeedbackRatings, value: RatingValue) => {
    setRatings((prev) => ({ ...prev, [field]: value }));
  }, []);

  const toggleHighlight = useCallback((id: string) => {
    setHighlight((prev) => (prev === id ? "" : id));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 6));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.min(Math.max(step, 1), 6));
  }, []);

  const submitFeedback = useCallback(async () => {
    setError(null);
    setView("generating");

    const payload: FeedbackData = {
      ...ratings,
      highlight,
      comment,
    };

    try {
      const result = await generateReview(payload);
      setGeneratedReview(result.review);
      if (result.google_review_url) {
        setGoogleReviewUrl(result.google_review_url);
      }
      setView("result");
    } catch (err) {
      setView("questionnaire");
      // Go to highlights step so user can see error and retry
      setCurrentStep(6);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to generate review. Please try again.");
      }
    }
  }, [ratings, highlight, comment]);

  const editAnswers = useCallback(() => {
    setView("questionnaire");
    setCurrentStep(1);
  }, []);

  return {
    ratings,
    setRating,
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
