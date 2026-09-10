import fs from "fs";
import path from "path";

try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key, ...vals] = trimmed.split("=");
        process.env[key.trim()] = vals.join("=").trim().replace(/^['"]|['"]$/g, "");
      }
    }
  }
} catch {
  // Ignore
}

import { FeedbackData } from "../types/feedback";
import { generateReviewWithGemini } from "../lib/gemini/generate-review";

interface TestCase {
  id: string;
  category: "high_positive" | "positive" | "neutral" | "mixed" | "negative";
  description: string;
  data: FeedbackData;
}

const TEST_CASES: TestCase[] = [
  // Tier 1: Highly Positive (5/5)
  {
    id: "HP-1",
    category: "high_positive",
    description: "Specialty coffee lover with casual note",
    data: {
      food: 5,
      service: 5,
      ambience: 5,
      value: 5,
      overall: 5,
      highlight: "Coffee",
      comment: "the iced oat vanilla latte was crazy good ngl",
      slang_intensity: "medium",
    },
  },
  {
    id: "HP-2",
    category: "high_positive",
    description: "Fast lunch, immaculate patio vibe",
    data: {
      food: 5,
      service: 5,
      ambience: 5,
      value: 4,
      overall: 5,
      highlight: "Atmosphere",
      comment: "sunlight on the patio was incredible, quick service too",
      slang_intensity: "medium",
    },
  },
  {
    id: "HP-3",
    category: "high_positive",
    description: "Dinner regular, wood-fired pizza standout",
    data: {
      food: 5,
      service: 5,
      ambience: 5,
      value: 5,
      overall: 5,
      highlight: "Food & Drinks",
      comment: "crust on the margherita was perfection. definitely coming back",
      slang_intensity: "low",
    },
  },
  {
    id: "HP-4",
    category: "high_positive",
    description: "First-time visitor, expressive young voice",
    data: {
      food: 5,
      service: 4,
      ambience: 5,
      value: 5,
      overall: 5,
      highlight: "Coffee",
      comment: "matcha latte was top tier and the music playlist was such a vibe",
      slang_intensity: "high",
    },
  },

  // Tier 2: Positive (4/5)
  {
    id: "P-1",
    category: "positive",
    description: "Solid weekend brunch, good drinks",
    data: {
      food: 4,
      service: 4,
      ambience: 4,
      value: 4,
      overall: 4,
      highlight: "Food & Drinks",
      comment: "Everything was tasty and came out quickly.",
      slang_intensity: "low",
    },
  },
  {
    id: "P-2",
    category: "positive",
    description: "Casual lunch with colleague",
    data: {
      food: 4,
      service: 5,
      ambience: 4,
      value: 4,
      overall: 4,
      highlight: "Service",
      comment: "Staff was super friendly and made great recommendations.",
      slang_intensity: "medium",
    },
  },
  {
    id: "P-3",
    category: "positive",
    description: "Afternoon work session",
    data: {
      food: 4,
      service: 4,
      ambience: 5,
      value: 4,
      overall: 4,
      highlight: "Atmosphere",
      comment: "really comfortable booths and good wifi. solid cold brew.",
      slang_intensity: "medium",
    },
  },
  {
    id: "P-4",
    category: "positive",
    description: "Takeout burger order",
    data: {
      food: 5,
      service: 4,
      ambience: 3,
      value: 4,
      overall: 4,
      highlight: "Food & Drinks",
      comment: "burgers were super fresh and fries stayed crispy on the way home",
      slang_intensity: "medium",
    },
  },

  // Tier 3: Neutral (3/5)
  {
    id: "N-1",
    category: "neutral",
    description: "Standard café stop, ordinary coffee",
    data: {
      food: 3,
      service: 3,
      ambience: 3,
      value: 3,
      overall: 3,
      highlight: "Coffee",
      comment: "Standard drip coffee, nothing particularly special.",
      slang_intensity: "low",
    },
  },
  {
    id: "N-2",
    category: "neutral",
    description: "Average weekday lunch",
    data: {
      food: 3,
      service: 3,
      ambience: 3,
      value: 3,
      overall: 3,
      highlight: "Food & Drinks",
      comment: "Decent sandwich, fine for a quick bite if you're nearby.",
      slang_intensity: "medium",
    },
  },
  {
    id: "N-3",
    category: "neutral",
    description: "Quick pitstop",
    data: {
      food: 3,
      service: 4,
      ambience: 3,
      value: 3,
      overall: 3,
      highlight: "Service",
      comment: "Cashier was pleasant enough, food was just okay.",
      slang_intensity: "medium",
    },
  },
  {
    id: "N-4",
    category: "neutral",
    description: "Unremarkable coffee shop visit",
    data: {
      food: 3,
      service: 3,
      ambience: 4,
      value: 3,
      overall: 3,
      highlight: "Atmosphere",
      comment: "Aesthetic space but the cappuccino was pretty average.",
      slang_intensity: "medium",
    },
  },

  // Tier 4: Mixed (Clear Pros and Cons)
  {
    id: "M-1",
    category: "mixed",
    description: "Great food & aesthetic, but slow service",
    data: {
      food: 5,
      service: 2,
      ambience: 5,
      value: 3,
      overall: 3,
      highlight: "Food & Drinks",
      comment: "Food was delicious and the space is stunning, but waited 40 mins for entrees.",
      slang_intensity: "medium",
    },
  },
  {
    id: "M-2",
    category: "mixed",
    description: "Excellent coffee, but pastry dry and expensive",
    data: {
      food: 3,
      service: 4,
      ambience: 4,
      value: 2,
      overall: 3,
      highlight: "Coffee",
      comment: "Flat white was great, but the croissant was stale and $18 felt pretty steep.",
      slang_intensity: "medium",
    },
  },
  {
    id: "M-3",
    category: "mixed",
    description: "Super staff, but deafening acoustics inside",
    data: {
      food: 4,
      service: 5,
      ambience: 2,
      value: 3,
      overall: 3,
      highlight: "Service",
      comment: "Servers were angels but it was so loud inside we could barely talk.",
      slang_intensity: "medium",
    },
  },
  {
    id: "M-4",
    category: "mixed",
    description: "Tasty food, but messed up table order",
    data: {
      food: 4,
      service: 2,
      ambience: 4,
      value: 3,
      overall: 3,
      highlight: "Atmosphere",
      comment: "Really liked the vibe and the pasta was good, but they forgot one of our sides.",
      slang_intensity: "medium",
    },
  },

  // Tier 5: Critical / Negative (1-2/5)
  {
    id: "NEG-1",
    category: "negative",
    description: "Cold food, hurried staff, disappointing visit",
    data: {
      food: 1,
      service: 2,
      ambience: 2,
      value: 1,
      overall: 1,
      highlight: "Food & Drinks",
      comment: "Food came out lukewarm and staff seemed annoyed when we asked to reheat.",
      slang_intensity: "medium",
    },
  },
  {
    id: "NEG-2",
    category: "negative",
    description: "Overpriced and forgotten drinks",
    data: {
      food: 2,
      service: 1,
      ambience: 3,
      value: 1,
      overall: 1,
      highlight: "Service",
      comment: "Waited 25 mins for two iced coffees that were never made. Had to ask for a refund.",
      slang_intensity: "medium",
    },
  },
  {
    id: "NEG-3",
    category: "negative",
    description: "Burned espresso and dirty tables",
    data: {
      food: 2,
      service: 2,
      ambience: 1,
      value: 2,
      overall: 2,
      highlight: "Atmosphere",
      comment: "Tables weren't wiped down and the espresso was bitter and burnt.",
      slang_intensity: "low",
    },
  },
  {
    id: "NEG-4",
    category: "negative",
    description: "Disappointing breakfast, rushed out",
    data: {
      food: 2,
      service: 1,
      ambience: 2,
      value: 1,
      overall: 1,
      highlight: "Food & Drinks",
      comment: "Eggs were cold and runny, and they brought the check before we even finished eating.",
      slang_intensity: "medium",
    },
  },
];

const CRINGE_PATTERNS = [
  /\bfr\s+fr\b/i,
  /\bno\s+cap\b/i,
  /\bong\b/i,
  /\bbussin\b/i,
  /\bslayed\b/i,
  /\bate\s+and\s+left\b/i,
  /\bfire\s+af\b/i,
  /💀|🔥|😭/,
];

const CORPORATE_PATTERNS = [
  /\bculinary\s+delight\b/i,
  /\btestament\s+to\b/i,
  /\bexceptional\s+service\b/i,
  /\bexceeded\s+expectations\b/i,
  /\bnestled\s+in\b/i,
  /\bpleasure\s+of\s+visiting\b/i,
  /\bhighly\s+recommend\s+to\s+all\b/i,
];

async function runEvaluation() {
  console.log("==================================================");
  console.log("REVIEWFLOW PROMPT EVALUATION MATRIX (20 CASES)");
  console.log("Model: gemini-3.8-flash via @google/genai");
  console.log("==================================================\n");

  const results: {
    id: string;
    category: string;
    review: string;
    wordCount: number;
    sentenceCount: number;
    hasCringe: boolean;
    hasCorporate: boolean;
    passedWordCount: boolean;
  }[] = [];

  for (let i = 0; i < TEST_CASES.length; i++) {
    const testCase = TEST_CASES[i];
    process.stdout.write(`[${i + 1}/20] Evaluating ${testCase.id} (${testCase.category})... `);

    try {
      const review = await generateReviewWithGemini(testCase.data);
      const words = review.trim().split(/\s+/).filter(Boolean);
      const wordCount = words.length;
      const sentenceCount = (review.match(/[^.!?]+[.!?]+/g) || [review]).length;

      const hasCringe = CRINGE_PATTERNS.some((pattern) => pattern.test(review));
      const hasCorporate = CORPORATE_PATTERNS.some((pattern) => pattern.test(review));
      const passedWordCount = wordCount >= 30 && wordCount <= 90;

      results.push({
        id: testCase.id,
        category: testCase.category,
        review,
        wordCount,
        sentenceCount,
        hasCringe,
        hasCorporate,
        passedWordCount,
      });

      console.log(`DONE (${wordCount} words, ${sentenceCount} sentences)`);
      // Small pause between live API calls
      await new Promise((r) => setTimeout(r, 600));
    } catch (err) {
      console.log(`FAILED: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log("\n==================================================");
  console.log("EVALUATION MATRIX SUMMARY");
  console.log("==================================================");

  let totalWords = 0;
  let cringeCount = 0;
  let corporateCount = 0;
  let wordCountViolations = 0;

  for (const res of results) {
    totalWords += res.wordCount;
    if (res.hasCringe) cringeCount++;
    if (res.hasCorporate) corporateCount++;
    if (!res.passedWordCount) wordCountViolations++;

    console.log(`\n--- [${res.id}] (${res.category.toUpperCase()}) ---`);
    console.log(`Output: "${res.review}"`);
    console.log(`Metrics: ${res.wordCount} words | ${res.sentenceCount} sentences | Cringe: ${res.hasCringe ? 'FAIL' : 'PASS'} | Corporate: ${res.hasCorporate ? 'FAIL' : 'PASS'}`);
  }

  const avgWords = Math.round(totalWords / results.length);
  console.log("\n==================================================");
  console.log(`TOTAL REVIEWS GENERATED: ${results.length}/20`);
  console.log(`AVERAGE WORD COUNT: ${avgWords} (Target: 35-80 words)`);
  console.log(`CRINGE / PARODY DETECTIONS: ${cringeCount} (Target: 0)`);
  console.log(`CORPORATE PR PHRASES DETECTIONS: ${corporateCount} (Target: 0)`);
  console.log(`WORD COUNT BOUNDARY COMPLIANCE: ${results.length - wordCountViolations}/${results.length}`);
  console.log("==================================================");
}

runEvaluation().catch(console.error);
