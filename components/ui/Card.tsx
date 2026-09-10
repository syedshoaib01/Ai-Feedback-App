"use client";

import React from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  variant?: "default" | "subtle" | "elevated";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default:
        "bg-card text-card-foreground border border-border/80 shadow-card dark:shadow-card-dark",
      subtle:
        "bg-card-subtle text-foreground border border-border/50",
      elevated:
        "bg-card text-card-foreground border border-border shadow-floating",
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={cn("rounded-3xl p-6 sm:p-8", variants[variant], className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";
