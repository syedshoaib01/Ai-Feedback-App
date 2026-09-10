"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { CATEGORIES } from "@/lib/constants";
import { useFeedbackFlow } from "@/hooks/useFeedbackFlow";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StepQuestion } from "./StepQuestion";
import { HighlightsStep } from "./HighlightsStep";
import { ReviewGenerating } from "../review/ReviewGenerating";
import { ReviewResult } from "../review/ReviewResult";
import { RatingSlider } from "./RatingSlider";
import { Button } from "@/components/ui/Button";
import { Sparkles, LayoutList, CheckSquare2 } from "lucide-react";

export function FeedbackFlow() {
  const {
    ratings,
    setRating,
    highlight,
    toggleHighlight,
    comment,
    setComment,
    currentStep,
    nextStep,
    prevStep,
    totalSteps,
    view,
    isAllQuestionsMode,
    setIsAllQuestionsMode,
    generatedReview,
    setGeneratedReview,
    googleReviewUrl,
    error,
    submitFeedback,
    editAnswers,
  } = useFeedbackFlow();

  const currentCategory = CATEGORIES[currentStep - 1];

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Questionnaire Card Container */}
      <Card className="relative overflow-hidden backdrop-blur-sm">
        <AnimatePresence mode="wait">
          {view === "generating" && <ReviewGenerating key="view-generating" />}

          {view === "result" && (
            <ReviewResult
              key="view-result"
              review={generatedReview}
              onChangeReview={setGeneratedReview}
              googleReviewUrl={googleReviewUrl}
              onEditAnswers={editAnswers}
            />
          )}

          {view === "questionnaire" && (
            <div key="view-questionnaire" className="space-y-6">
              {/* Header with Mode Toggle & Progress */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    How was your visit?
                  </h1>

                  {/* Guided vs All Questions Mode Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsAllQuestionsMode((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-muted-foreground hover:text-foreground bg-card-subtle border border-border/80 transition-colors"
                    title={
                      isAllQuestionsMode
                        ? "Switch to guided step-by-step view"
                        : "View all questions on one page"
                    }
                  >
                    {isAllQuestionsMode ? (
                      <>
                        <CheckSquare2 className="w-3.5 h-3.5 text-brand" />
                        <span className="hidden sm:inline">Guided View</span>
                      </>
                    ) : (
                      <>
                        <LayoutList className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">View All</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Progress Bar (Visible in Guided Mode) */}
                {!isAllQuestionsMode && (
                  <ProgressBar
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    stepLabel={
                      currentStep <= CATEGORIES.length
                        ? currentCategory?.title
                        : "Highlights"
                    }
                  />
                )}
              </div>

              {/* Guided Step-by-Step Flow */}
              {!isAllQuestionsMode ? (
                <div className="min-h-[260px] flex flex-col justify-between">
                  <AnimatePresence mode="wait">
                    {currentStep <= CATEGORIES.length && currentCategory ? (
                      <StepQuestion
                        key={currentCategory.id}
                        category={currentCategory}
                        value={ratings[currentCategory.id]}
                        onChange={(val) => setRating(currentCategory.id, val)}
                        onNext={nextStep}
                        onPrev={prevStep}
                        isFirst={currentStep === 1}
                        stepIndex={currentStep}
                        totalSteps={totalSteps}
                      />
                    ) : (
                      <HighlightsStep
                        key="step-highlights"
                        highlight={highlight}
                        onSelectHighlight={toggleHighlight}
                        comment={comment}
                        onChangeComment={setComment}
                        onSubmit={submitFeedback}
                        onPrev={prevStep}
                        isGenerating={false}
                        errorMessage={error || undefined}
                        onRetry={submitFeedback}
                      />
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* All-on-One-Page View */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    {CATEGORIES.map((cat) => (
                      <div
                        key={cat.id}
                        className="bg-card-subtle p-4 sm:p-5 rounded-2xl border border-border/80 space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl" role="img" aria-hidden="true">
                            {cat.icon}
                          </span>
                          <span className="font-bold text-sm text-foreground">
                            {cat.title}
                          </span>
                        </div>
                        <RatingSlider
                          id={`all-${cat.id}`}
                          name={cat.id}
                          value={ratings[cat.id]}
                          onChange={(val) => setRating(cat.id, val)}
                          ariaLabel={`${cat.title} rating`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Highlights & Comments in All View */}
                  <HighlightsStep
                    highlight={highlight}
                    onSelectHighlight={toggleHighlight}
                    comment={comment}
                    onChangeComment={setComment}
                    onSubmit={submitFeedback}
                    showPrev={false}
                    isGenerating={false}
                    errorMessage={error || undefined}
                    onRetry={submitFeedback}
                  />
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
