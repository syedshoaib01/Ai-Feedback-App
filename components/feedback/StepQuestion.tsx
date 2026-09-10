"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CategoryItem, RatingValue } from "@/types/feedback";
import { RATING_DESCRIPTORS } from "@/lib/constants";
import { RatingSlider } from "./RatingSlider";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepQuestionProps {
  category: CategoryItem;
  value: RatingValue;
  onChange: (val: RatingValue) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  stepIndex: number;
  totalSteps: number;
}

export function StepQuestion({
  category,
  value,
  onChange,
  onNext,
  onPrev,
  isFirst,
  stepIndex,
  totalSteps,
}: StepQuestionProps) {
  const descriptor = RATING_DESCRIPTORS[value] || RATING_DESCRIPTORS[5];

  return (
    <motion.div
      key={category.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.22, ease: "easeInOut" }}
      className="space-y-6"
    >
      {/* 1. SMALL CONTEXT: Category Pill */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-card-subtle text-muted-foreground border border-border/70">
          <span role="img" aria-hidden="true" className="text-sm">
            {category.icon}
          </span>
          <span>{category.title}</span>
        </span>
      </div>

      {/* 2. LARGE PRIMARY QUESTION */}
      <div className="space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
          {category.question || `How was the ${category.title.toLowerCase()}?`}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {category.subtitle}
        </p>
      </div>

      {/* 3. INTERACTIVE SLIDER CONTAINER WITH PROMINENT RATING */}
      <div className="bg-card-subtle p-5 sm:p-6 rounded-3xl border border-border/80 shadow-sm space-y-4">
        {/* LARGE INTERACTIVE VALUE & SUPPORTING BADGE */}
        <div className="flex items-baseline justify-between border-b border-border/50 pb-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-foreground">
              {value}
            </span>
            <span className="text-sm font-bold text-muted-foreground font-mono">
              / 5
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={value}
              initial={{ opacity: 0, scale: 0.9, y: -2 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 2 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold border shadow-xs transition-colors",
                descriptor.badgeBg,
                descriptor.badgeText,
                descriptor.badgeBorder
              )}
            >
              <span>{descriptor.expression}</span>
              <span>{descriptor.label}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* PRIMARY INTERACTION: Tactile Slider */}
        <RatingSlider
          id={`slider-${category.id}`}
          name={category.id}
          value={value}
          onChange={onChange}
          ariaLabel={`${category.title} rating`}
          hideHeader
        />
      </div>

      {/* 4. PRIMARY NAVIGATION CTA */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {!isFirst ? (
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onPrev}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            aria-label="Previous question"
            className="min-h-[48px]"
          >
            Back
          </Button>
        ) : (
          <div />
        )}

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={onNext}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="ml-auto min-w-[130px] min-h-[48px]"
        >
          {stepIndex === totalSteps ? "Finish" : "Next"}
        </Button>
      </div>
    </motion.div>
  );
}
