"use client";

import React from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Sparkles } from "lucide-react";

export function ProgressHeader() {
  return (
    <header className="flex items-center justify-between py-2 mb-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-extrabold text-xl sm:text-2xl tracking-tight text-foreground select-none">
          <span>review</span>
          <span className="text-muted-foreground font-normal">flow</span>
        </div>

        <div className="hidden xs:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-accent-gemini-bg text-accent-gemini">
          <Sparkles className="w-3 h-3" />
          <span>AI-Powered</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
