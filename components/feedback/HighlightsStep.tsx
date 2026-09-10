"use client";

import React from "react";
import { motion } from "motion/react";
import { HIGHLIGHT_OPTIONS } from "@/lib/constants";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Sparkles } from "lucide-react";

interface HighlightsStepProps {
  highlight: string;
  onSelectHighlight: (id: string) => void;
  comment: string;
  onChangeComment: (val: string) => void;
  onSubmit: () => void;
  onPrev?: () => void;
  showPrev?: boolean;
  isGenerating: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

export function HighlightsStep({
  highlight,
  onSelectHighlight,
  comment,
  onChangeComment,
  onSubmit,
  onPrev,
  showPrev = true,
  isGenerating,
  errorMessage,
  onRetry,
}: HighlightsStepProps) {
  return (
    <motion.div
      key="highlights-step"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
          Highlights & Thoughts
        </h2>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200 flex items-start justify-between gap-3 text-sm"
        >
          <div>
            <p className="font-bold">Generation Issue</p>
            <p className="text-xs opacity-90 mt-0.5">{errorMessage}</p>
          </div>
          {onRetry && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-900/50 shrink-0"
            >
              Retry
            </Button>
          )}
        </div>
      )}

      {/* Highlight Chips */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
          What stood out? <span className="normal-case opacity-60 font-normal">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {HIGHLIGHT_OPTIONS.map((item) => (
            <Chip
              key={item.id}
              label={item.label}
              icon={item.icon}
              selected={highlight === item.id}
              onClick={() => onSelectHighlight(item.id)}
            />
          ))}
        </div>
      </div>

      {/* Qualitative Comment Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <label htmlFor="customer-comment">
            In your own words <span className="normal-case opacity-60 font-normal">(optional)</span>
          </label>
          <span className="font-mono">{comment.length}/300</span>
        </div>

        <textarea
          id="customer-comment"
          rows={3}
          maxLength={300}
          value={comment}
          onChange={(e) => onChangeComment(e.target.value)}
          placeholder="Anything specific you loved or felt could improve (e.g. loved the iced latte, patio was super chill)..."
          className="w-full rounded-2xl border border-border bg-card-subtle p-3.5 sm:p-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:bg-card focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-colors resize-none"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {showPrev && onPrev ? (
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onPrev}
            disabled={isGenerating}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            aria-label="Previous step"
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
          onClick={onSubmit}
          isLoading={isGenerating}
          rightIcon={<Sparkles className="w-4 h-4" />}
          className="ml-auto min-w-[170px]"
        >
          Draft my review
        </Button>
      </div>
    </motion.div>
  );
}
