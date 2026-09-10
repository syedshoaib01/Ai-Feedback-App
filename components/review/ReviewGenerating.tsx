"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";

const GENERATION_PHRASES = [
  "Putting your experience into words...",
  "Catching your authentic vibe...",
  "Drafting your personalized review...",
];

export function ReviewGenerating() {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % GENERATION_PHRASES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      key="generating-state"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-6"
    >
      {/* Animated AI Icon Container */}
      <div className="relative">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-16 h-16 rounded-3xl bg-foreground text-background flex items-center justify-center shadow-lg shadow-foreground/20"
        >
          <Sparkles className="w-8 h-8 text-amber-400" />
        </motion.div>

        {/* Ambient Ring */}
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
          className="absolute inset-0 rounded-3xl border-2 border-foreground/30 pointer-events-none"
        />
      </div>

      {/* Dynamic Phrase Carousel */}
      <div className="h-10 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={phraseIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="text-base sm:text-lg font-bold text-foreground"
          >
            {GENERATION_PHRASES[phraseIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Shimmer Preview Card Placeholder */}
      <div className="w-full max-w-md bg-card-subtle rounded-2xl p-5 border border-border/70 space-y-3">
        <div className="h-3.5 bg-muted rounded-full w-4/5 animate-pulse" />
        <div className="h-3.5 bg-muted rounded-full w-full animate-pulse delay-75" />
        <div className="h-3.5 bg-muted rounded-full w-3/4 animate-pulse delay-150" />
      </div>
    </motion.div>
  );
}
