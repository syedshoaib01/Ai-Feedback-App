"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface ChipProps {
  label: string;
  icon?: string;
  selected?: boolean;
  onClick: () => void;
  className?: string;
}

export function Chip({ label, icon, selected, onClick, className }: ChipProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 450, damping: 25 }}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all select-none border min-h-[44px]",
        selected
          ? "bg-foreground text-background border-foreground shadow-sm shadow-foreground/20"
          : "bg-card text-foreground border-border/80 hover:bg-card-subtle hover:border-border",
        className
      )}
    >
      {icon && <span className="text-base leading-none">{icon}</span>}
      <span>{label}</span>
    </motion.button>
  );
}
