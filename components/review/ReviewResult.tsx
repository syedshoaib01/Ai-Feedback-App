"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Sparkles, Copy, Check, ArrowLeft, Star, AlertCircle } from "lucide-react";
import { hapticFeedback } from "@/lib/utils";

interface ReviewResultProps {
  review: string;
  onChangeReview: (text: string) => void;
  googleReviewUrl?: string;
  onEditAnswers: () => void;
}

export function ReviewResult({
  review,
  onChangeReview,
  googleReviewUrl,
  onEditAnswers,
}: ReviewResultProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(review);
      hapticFeedback(20);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback for non-secure context or older devices
      const el = document.createElement("textarea");
      el.value = review;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      hapticFeedback(20);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const hasGoogleUrl = Boolean(googleReviewUrl && googleReviewUrl.trim().length > 0);

  return (
    <motion.div
      key="review-result"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Status Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent-gemini-bg text-accent-gemini border border-accent-gemini/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Drafted with Gemini</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Here&apos;s your review draft ✨
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          You are the author. Feel free to edit words, add details, or change anything before sharing.
        </p>
      </div>

      {/* Editable Review Card */}
      <div className="relative group">
        <label htmlFor="generated-review-textarea" className="sr-only">
          Edit your generated review draft
        </label>
        <textarea
          id="generated-review-textarea"
          rows={6}
          value={review}
          onChange={(e) => onChangeReview(e.target.value)}
          spellCheck
          className="w-full rounded-2xl border-2 border-border bg-card-subtle p-4 sm:p-5 text-sm sm:text-base text-foreground leading-relaxed focus:bg-card focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-all resize-y shadow-inner font-sans"
        />
        <div className="absolute bottom-3 right-3 text-[11px] font-mono text-muted-foreground bg-card/80 backdrop-blur-sm px-2 py-0.5 rounded-md border border-border/50">
          Tap to edit
        </div>
      </div>

      {/* Secondary Actions: Edit Answers & Copy Review */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onEditAnswers}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="w-full order-2 sm:order-1"
        >
          Edit answers
        </Button>

        <Button
          type="button"
          variant={copied ? "primary" : "outline"}
          size="md"
          onClick={handleCopy}
          leftIcon={
            copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )
          }
          className={`w-full order-1 sm:order-2 transition-all ${
            copied
              ? "bg-emerald-700 text-white hover:bg-emerald-800 border-emerald-700"
              : ""
          }`}
        >
          {copied ? "Copied to clipboard!" : "Copy review"}
        </Button>
      </div>

      {/* Primary Google Maps CTA */}
      <div className="pt-2">
        {hasGoogleUrl ? (
          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => hapticFeedback(15)}
            className="w-full h-14 rounded-2xl flex items-center justify-center gap-2.5 bg-accent-google hover:bg-accent-google-hover text-white font-bold text-base shadow-lg shadow-accent-google/25 transition-all hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] select-none"
          >
            <Star className="w-5 h-5 fill-white text-white" />
            <span>Continue to Google Reviews →</span>
          </a>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 flex items-start gap-3 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Google Review link not configured yet</p>
              <p className="opacity-90">
                To link directly to your Google Business profile, set{" "}
                <code className="bg-amber-200/50 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono">
                  GOOGLE_REVIEW_URL
                </code>{" "}
                in your environment variables.
              </p>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-center text-muted-foreground pt-1">
        Your review is yours. Edit anything you want before sharing to Google.
      </p>
    </motion.div>
  );
}
