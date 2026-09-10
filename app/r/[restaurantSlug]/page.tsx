import React from "react";
import { Metadata } from "next";
import { ProgressHeader } from "@/components/feedback/ProgressHeader";
import { FeedbackFlow } from "@/components/feedback/FeedbackFlow";
import { getRestaurantConfig } from "@/lib/restaurant/config";

interface RestaurantPageProps {
  params: Promise<{
    restaurantSlug: string;
  }>;
}

export async function generateMetadata({
  params,
}: RestaurantPageProps): Promise<Metadata> {
  const { restaurantSlug } = await params;
  const restaurant = getRestaurantConfig(restaurantSlug);

  return {
    title: `${restaurant.name} — Review & Feedback`,
    description:
      restaurant.tagline ||
      `Share your genuine feedback for ${restaurant.name} powered by ReviewFlow.`,
  };
}

export default async function RestaurantFeedbackPage({
  params,
}: RestaurantPageProps) {
  const { restaurantSlug } = await params;
  const restaurant = getRestaurantConfig(restaurantSlug);

  return (
    <main className="min-h-dvh flex flex-col justify-between px-4 sm:px-6 py-4 sm:py-8 max-w-2xl mx-auto pb-safe">
      <div className="w-full">
        <ProgressHeader venueName={restaurant.name} />
        <FeedbackFlow restaurantConfig={restaurant} />
      </div>
    </main>
  );
}
