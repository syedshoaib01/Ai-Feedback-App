import { generateReviewWithGemini } from "../lib/gemini/generate-review";
import { FeedbackData } from "../types/feedback";
import fs from "fs";
import path from "path";

// Manually load .env if not loaded
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

async function runEvaluation() {
  console.log("==================================================");
  console.log("STARTING LIVE GEMINI PROMPT QUALITY EVALUATION");
  console.log("Model:", process.env.GEMINI_MODEL || "gemini-3.5-flash");
  console.log("==================================================\n");

  const testCases: Array<{ name: string; data: FeedbackData }> = [
    {
      name: "1. High Positive (Medium Slang)",
      data: {
        food: 5,
        service: 5,
        ambience: 5,
        value: 4,
        overall: 5,
        highlight: "Coffee",
        comment: "Best matcha latte in town, staff was super kind.",
        slang_intensity: "medium",
      },
    },
    {
      name: "2. High Positive Variation (Medium Slang - Different Opening)",
      data: {
        food: 5,
        service: 4,
        ambience: 5,
        value: 5,
        overall: 5,
        highlight: "Atmosphere",
        comment: "Such a peaceful vibe to read a book.",
        slang_intensity: "medium",
      },
    },
    {
      name: "3. Mixed Experience (Candid balance)",
      data: {
        food: 4,
        service: 2,
        ambience: 5,
        value: 2,
        overall: 3,
        highlight: "Atmosphere",
        comment: "Super cute place but had to wait 30 mins for two coffees.",
        slang_intensity: "medium",
      },
    },
    {
      name: "4. Negative Experience (Dissatisfied / Direct)",
      data: {
        food: 2,
        service: 2,
        ambience: 3,
        value: 2,
        overall: 2,
        comment: "Cold croissants and felt totally rushed out.",
        slang_intensity: "medium",
      },
    },
    {
      name: "5. High Slang Intensity (Believable Internet-Native)",
      data: {
        food: 5,
        service: 5,
        ambience: 5,
        value: 4,
        overall: 5,
        highlight: "Food",
        comment: "The avocado toast is unreal.",
        slang_intensity: "high",
      },
    },
    {
      name: "6. Low Slang Intensity (Conversational Clean)",
      data: {
        food: 5,
        service: 4,
        ambience: 4,
        value: 4,
        overall: 5,
        highlight: "Coffee",
        comment: "Consistently good espresso and nice staff.",
        slang_intensity: "low",
      },
    },
  ];

  for (const tc of testCases) {
    console.log(`--- ${tc.name} ---`);
    console.log(`Input: Food:${tc.data.food}, Service:${tc.data.service}, Ambience:${tc.data.ambience}, Value:${tc.data.value}, Overall:${tc.data.overall}`);
    if (tc.data.highlight) console.log(`Highlight: "${tc.data.highlight}"`);
    if (tc.data.comment) console.log(`Customer Note: "${tc.data.comment}"`);
    try {
      const review = await generateReviewWithGemini(tc.data);
      const wordCount = review.split(/\s+/).filter(Boolean).length;
      console.log(`\nReview (${wordCount} words):`);
      console.log(`"${review}"\n`);
    } catch (err) {
      console.error(`ERROR in ${tc.name}:`, err);
    }
  }

  console.log("==================================================");
  console.log("EVALUATION COMPLETE");
  console.log("==================================================");
}

runEvaluation().catch(console.error);
