"use client";

import React from "react";
import { motion } from "motion/react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabel?: string;
}

export function ProgressBar({ currentStep, totalSteps, stepLabel }: ProgressBarProps) {
  const progressPercent = Math.min(
    100,
    Math.max(0, (currentStep / totalSteps) * 100)
  );

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs font-bold tracking-wider uppercase text-muted-foreground">
        <span>{stepLabel || "Progress"}</span>
        <span className="font-mono text-foreground font-semibold">
          0{currentStep} <span className="text-muted-foreground">/ 0{totalSteps}</span>
        </span>
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/70">
        <motion.div
          className="h-full rounded-full bg-foreground"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>
    </div>
  );
}
