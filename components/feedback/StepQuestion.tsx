"use client";

import React from "react";
import { motion } from "motion/react";
import { CategoryItem, RatingValue } from "@/lib/types";
import { RatingSlider } from "./RatingSlider";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
  return (
    <motion.div
      key={category.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="space-y-6"
    >
      {/* Category Header */}
      <div className="flex items-center gap-2.5">
        <span className="text-2xl sm:text-3xl" role="img" aria-hidden="true">
          {category.icon}
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
          {category.title}
        </h2>
      </div>

      {/* Interactive Rating Slider */}
      <div className="bg-card-subtle p-5 sm:p-6 rounded-2xl border border-border/80">
        <RatingSlider
          id={`slider-${category.id}`}
          name={category.id}
          value={value}
          onChange={onChange}
          ariaLabel={`${category.title} rating`}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {!isFirst ? (
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onPrev}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            aria-label="Previous question"
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
          className="ml-auto min-w-[120px]"
        >
          {stepIndex === totalSteps ? "Finish" : "Next"}
        </Button>
      </div>
    </motion.div>
  );
}
