"use client";

import React, { forwardRef } from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "google";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98]";

    const sizeStyles = {
      sm: "h-9 px-3.5 text-xs rounded-xl gap-1.5",
      md: "h-12 px-5 text-sm rounded-2xl gap-2",
      lg: "h-14 px-6 text-base rounded-2xl gap-2.5 font-bold",
    };

    const variantStyles = {
      primary:
        "bg-foreground text-background hover:opacity-90 shadow-subtle hover:shadow-md",
      secondary:
        "bg-card-subtle text-foreground hover:bg-muted border border-border/80",
      outline:
        "border-2 border-border bg-transparent hover:bg-card-subtle text-foreground",
      ghost:
        "hover:bg-card-subtle text-foreground",
      google:
        "bg-accent-google hover:bg-accent-google-hover text-white shadow-md shadow-accent-google/25",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
