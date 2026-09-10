import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hapticFeedback(pattern: number | number[] = 10) {
  if (typeof window !== "undefined" && "navigator" in window && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore errors on non-supporting devices
    }
  }
}

export function sanitizeErrorMessage(err: unknown, apiKey?: string): string {
  let message = "An unexpected error occurred.";
  if (err instanceof Error) {
    message = err.message;
  } else if (typeof err === "string") {
    message = err;
  }

  if (apiKey && apiKey.length > 5 && message.includes(apiKey)) {
    message = message.replaceAll(apiKey, "[REDACTED]");
  }

  return message;
}
