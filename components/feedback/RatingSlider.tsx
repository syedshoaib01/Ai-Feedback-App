"use client";

import React, { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RatingValue, UiRatingValue } from "@/types/feedback";
import { RATING_DESCRIPTORS, UNRATED_DESCRIPTOR } from "@/lib/constants";
import { cn, hapticFeedback } from "@/lib/utils";

export interface RatingSliderProps {
  id?: string;
  name?: string;
  value: UiRatingValue;
  onChange: (value: RatingValue) => void;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
  hideHeader?: boolean;
}

export function RatingSlider({
  id,
  name,
  value,
  onChange,
  ariaLabel = "Rating slider",
  disabled = false,
  className,
  hideHeader = false,
}: RatingSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragStartValRef = useRef<UiRatingValue>(value);

  const isRated = value !== null && value >= 1 && value <= 5;
  const descriptor = isRated ? RATING_DESCRIPTORS[value] : UNRATED_DESCRIPTOR;
  const percentage = isRated ? ((value - 1) / 4) * 100 : 0;

  // Pure state update without vibration during dragging
  const updateRating = useCallback(
    (newVal: number) => {
      const clamped = Math.min(5, Math.max(1, Math.round(newVal))) as RatingValue;
      if (clamped !== value) {
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
      updateRating(computed);
    },
    [updateRating]
  );

  // Native range change (keyboard navigation & accessibility)
  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      updateRating(val);
      hapticFeedback(12);
    }
  };

  // Direct tick button tap
  const handleTickClick = (tick: RatingValue) => {
    if (disabled || tick === value) return;
    updateRating(tick);
    hapticFeedback(12);
  };

  // Direct key tap for 1-5 keys
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (["1", "2", "3", "4", "5"].includes(e.key)) {
      e.preventDefault();
      const num = parseInt(e.key, 10) as RatingValue;
      updateRating(num);
      hapticFeedback(12);
    }
  };

  // Pointer drag & tap-to-position support
  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    setIsDragging(true);
    dragStartValRef.current = value;
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
    // Only fire subtle haptic once upon release/commit if rating changed
    if (value !== dragStartValRef.current && value !== null) {
      hapticFeedback(12);
    }
  };

  return (
    <div className={cn("w-full space-y-3 select-none", className)}>
      {/* Animated Rating Badge & Contextual Descriptor (hidden if parent renders its own) */}
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Rating
          </span>

          <AnimatePresence mode="wait">
            {isRated ? (
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
            ) : (
              <motion.div
                key="unrated-header-badge"
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border border-dashed border-border text-muted-foreground bg-muted/40"
              >
                <span>Choose a rating</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Interactive Track Container (Tap-to-position & Drag) */}
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
            animate={{
              width: isRated ? `${percentage}%` : "0%",
              opacity: isRated ? 1 : 0,
            }}
            transition={{
              type: isDragging ? "tween" : "spring",
              duration: isDragging ? 0.05 : 0.25,
              stiffness: 400,
              damping: 30,
            }}
          />
        </div>

        {/* Custom Draggable Thumb with Visual/Tactile Scale Effect */}
        <motion.div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-card border-2 flex items-center justify-center pointer-events-none z-10 transition-colors",
            isRated
              ? "border-foreground shadow-md"
              : "border-dashed border-muted-foreground/60 text-muted-foreground shadow-none",
            isDragging && "scale-115 shadow-xl ring-4 ring-foreground/20"
          )}
          initial={false}
          animate={{
            left: isRated ? `${percentage}%` : "0%",
            opacity: isRated ? 1 : 0.75,
          }}
          transition={{
            type: isDragging ? "tween" : "spring",
            duration: isDragging ? 0.05 : 0.25,
            stiffness: 400,
            damping: 30,
          }}
        >
          <span className="text-xs font-bold text-foreground font-mono">
            {isRated ? value : "—"}
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
          value={value ?? 1}
          onChange={handleNativeChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-valuenow={value ?? undefined}
          aria-valuemin={1}
          aria-valuemax={5}
          aria-valuetext={
            isRated
              ? `${descriptor.label} (${value} out of 5)`
              : "No rating selected. Choose a rating from 1 to 5."
          }
          className="sr-only focus:not-sr-only focus:absolute focus:inset-0 focus:opacity-0 focus:z-20 cursor-pointer"
        />
      </div>

      {/* Discrete Tick Numbers with Direct Tap Targets */}
      <div className="flex justify-between px-1 text-xs font-semibold text-muted-foreground font-mono">
        {([1, 2, 3, 4, 5] as RatingValue[]).map((tick) => (
          <button
            key={tick}
            type="button"
            onClick={() => handleTickClick(tick)}
            className={cn(
              "w-8 h-8 -mt-1 flex items-center justify-center rounded-full transition-all cursor-pointer hover:text-foreground hover:bg-card-subtle active:scale-90",
              isRated && tick === value
                ? "text-foreground font-bold bg-card-subtle shadow-sm"
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
