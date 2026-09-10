"use client";

import React, { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RatingValue } from "@/lib/types";
import { RATING_DESCRIPTORS } from "@/lib/constants";
import { cn, hapticFeedback } from "@/lib/utils";

export interface RatingSliderProps {
  id?: string;
  name?: string;
  value: RatingValue;
  onChange: (value: RatingValue) => void;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
}

export function RatingSlider({
  id,
  name,
  value,
  onChange,
  ariaLabel = "Rating slider",
  disabled = false,
  className,
}: RatingSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const descriptor = RATING_DESCRIPTORS[value] || RATING_DESCRIPTORS[5];
  const percentage = ((value - 1) / 4) * 100;

  const handleRatingChange = useCallback(
    (newVal: number) => {
      const clamped = Math.min(5, Math.max(1, Math.round(newVal))) as RatingValue;
      if (clamped !== value) {
        hapticFeedback(12);
        onChange(clamped);
      }
    },
    [value, onChange]
  );

  const calculateValueFromPointer = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const ratio = Math.min(Math.max(relativeX / rect.width, 0), 1);
      const computed = 1 + ratio * 4;
      handleRatingChange(computed);
    },
    [handleRatingChange]
  );

  // Native range change (keyboard & fallback)
  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    handleRatingChange(val);
  };

  // Pointer drag support
  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    calculateValueFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || disabled) return;
    calculateValueFromPointer(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (disabled) return;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if not captured
    }
  };

  return (
    <div className={cn("w-full space-y-3 select-none", className)}>
      {/* Animated Rating Badge & Contextual Descriptor */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Rating
        </span>

        <AnimatePresence mode="wait">
          <motion.div
            key={value}
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold border transition-colors",
              descriptor.badgeBg,
              descriptor.badgeText,
              descriptor.badgeBorder
            )}
          >
            <span>{descriptor.expression}</span>
            <span>{descriptor.label}</span>
            <span className="opacity-70">({value}/5)</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Interactive Track Container */}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => setIsDragging(false)}
        className="relative py-4 cursor-pointer touch-none"
      >
        {/* Track Background */}
        <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
          {/* Active Fill Track */}
          <motion.div
            className="absolute top-0 bottom-0 left-0 bg-foreground rounded-full"
            initial={false}
            animate={{ width: `${percentage}%` }}
            transition={{
              type: isDragging ? "tween" : "spring",
              duration: isDragging ? 0.05 : 0.25,
              stiffness: 400,
              damping: 30,
            }}
          />
        </div>

        {/* Custom Draggable Thumb */}
        <motion.div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-card border-2 border-foreground shadow-md flex items-center justify-center pointer-events-none z-10",
            isDragging && "scale-110 shadow-xl ring-4 ring-foreground/15"
          )}
          initial={false}
          animate={{ left: `${percentage}%` }}
          transition={{
            type: isDragging ? "tween" : "spring",
            duration: isDragging ? 0.05 : 0.25,
            stiffness: 400,
            damping: 30,
          }}
        >
          <span className="text-xs font-bold text-foreground font-mono">
            {value}
          </span>
        </motion.div>

        {/* Invisible Accessible Native Range for Keyboard Navigation */}
        <input
          id={id}
          name={name}
          type="range"
          min="1"
          max="5"
          step="1"
          value={value}
          onChange={handleNativeChange}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-valuenow={value}
          aria-valuemin={1}
          aria-valuemax={5}
          aria-valuetext={`${descriptor.label} (${value} out of 5)`}
          className="sr-only focus:not-sr-only focus:absolute focus:inset-0 focus:opacity-0 focus:z-20 cursor-pointer"
        />
      </div>

      {/* Discrete Tick Numbers with Direct Tap Targets */}
      <div className="flex justify-between px-1 text-xs font-semibold text-muted-foreground font-mono">
        {[1, 2, 3, 4, 5].map((tick) => (
          <button
            key={tick}
            type="button"
            onClick={() => handleRatingChange(tick)}
            className={cn(
              "w-8 h-8 -mt-1 flex items-center justify-center rounded-full transition-colors cursor-pointer hover:text-foreground hover:bg-card-subtle",
              tick === value
                ? "text-foreground font-bold"
                : "text-muted-foreground"
            )}
            aria-label={`Select rating ${tick}`}
          >
            {tick}
          </button>
        ))}
      </div>
    </div>
  );
}
