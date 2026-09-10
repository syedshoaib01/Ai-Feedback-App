import React from "react";
import { ProgressHeader } from "@/components/feedback/ProgressHeader";
import { FeedbackFlow } from "@/components/feedback/FeedbackFlow";

export default function HomePage() {
  return (
    <main className="min-h-dvh flex flex-col justify-between px-4 sm:px-6 py-4 sm:py-8 max-w-2xl mx-auto pb-safe">
      <div className="w-full">
        <ProgressHeader />
        <FeedbackFlow />
      </div>
    </main>
  );
}
