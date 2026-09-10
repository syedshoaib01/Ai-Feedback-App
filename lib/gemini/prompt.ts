import { FeedbackData, SlangIntensity } from "@/types/feedback";
import { SCORE_LABELS } from "@/lib/constants";

export interface PromptBuildResult {
  systemInstruction: string;
  prompt: string;
}

type SentimentTier = "high_positive" | "positive" | "neutral" | "mixed" | "negative";

function analyzeSentiment(data: FeedbackData): {
  tier: SentimentTier;
  guidance: string;
} {
  const scores = [data.food, data.service, data.ambience, data.value, data.overall];
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const overall = data.overall;

  const hasLow = scores.some((s) => s <= 2);
  const hasHigh = scores.some((s) => s >= 4);

  // Critical / Negative
  if (overall <= 2 || avg < 2.3) {
    return {
      tier: "negative",
      guidance:
        "SENTIMENT: CRITICAL / DISSATISFIED\n" +
        "- The customer had an unsatisfactory experience. The review must sound candid, disappointed, and direct.\n" +
        "- DO NOT sugarcoat, DO NOT make it cheerful, and DO NOT invent praise.\n" +
        "- Express polite but honest critique (e.g. 'really wanted to like this place, but...', 'probably wouldn't return', 'just wasn't it').",
    };
  }

  // Mixed Feedback
  if ((hasLow && hasHigh) || (overall === 3 && (data.food !== data.service || data.food !== data.value))) {
    return {
      tier: "mixed",
      guidance:
        "SENTIMENT: MIXED / BALANCED\n" +
        "- The customer experienced clear pros and cons (e.g. good food but slow service, or nice atmosphere but poor value).\n" +
        "- You MUST honestly balance both sides. Do not make it sound 100% positive or 100% negative.\n" +
        "- Acknowledge the bright spots while being real about the shortcomings.",
    };
  }

  // Neutral / Average
  if (overall === 3 && avg >= 2.8 && avg <= 3.4) {
    return {
      tier: "neutral",
      guidance:
        "SENTIMENT: AVERAGE / OKAY (3/5)\n" +
        "- The visit was average or decent, but didn't blow them away.\n" +
        "- Sound casual and matter-of-fact (e.g. 'pretty standard experience', 'decent spot for a quick stop, nothing mindblowing').",
    };
  }

  // High Positive
  if (overall === 5 && avg >= 4.4) {
    return {
      tier: "high_positive",
      guidance:
        "SENTIMENT: HIGHLY ENTHUSIASTIC (5/5)\n" +
        "- The customer genuinely loved their visit. Sound excited, appreciative, and eager to recommend.\n" +
        "- Sound like a real person telling a friend, not an overly formal corporate endorsement.",
    };
  }

  // Generally Positive
  return {
    tier: "positive",
    guidance:
      "SENTIMENT: POSITIVE & SATISFIED (4/5)\n" +
      "- A solid, enjoyable visit with high satisfaction.\n" +
      "- Warm and favorable tone with relaxed approval.",
  };
}

function detectCustomerVoiceProfile(comment: string): {
  isCustomerCasual: boolean;
  hasCustomerSlang: boolean;
} {
  const lower = comment.toLowerCase();
  const casualMarkers = ["ngl", "lowkey", "tbh", "fire", "slaps", "insane", "vibe", "vibes", "super", "kinda", "crying"];
  const hasCustomerSlang = casualMarkers.some((m) => lower.includes(m));
  const isCustomerCasual = hasCustomerSlang || /!{2,}|\?{2,}/.test(comment) || comment.length < 30;

  return { isCustomerCasual, hasCustomerSlang };
}

// 4 distinct conversational writing cadences so generated reviews feel like DIFFERENT people wrote them
const CADENCE_PROFILES = [
  {
    name: "punchy_fragmented",
    instruction:
      "RHYTHM: Punchy & direct. Use 2-3 short sentences. You may use a natural sentence fragment (e.g. 'Super chill atmosphere. Food was fresh and service was quick. Definitely coming back.').",
  },
  {
    name: "conversational_smooth",
    instruction:
      "RHYTHM: Flowing conversational rhythm. Combine a brief observation with a casual personal takeaway. Vary sentence lengths naturally.",
  },
  {
    name: "observant_candid",
    instruction:
      "RHYTHM: Grounded and observant. Lead directly with the highlight or general impression without introductory filler words.",
  },
  {
    name: "casual_spoken",
    instruction:
      "RHYTHM: Effortless mobile-typed voice. Sound like a quick voice note transcribed into a 30-second Google review.",
  },
];

function getSlangDistributionGuidance(
  intensity: SlangIntensity,
  customerHasSlang: boolean
): string {
  if (customerHasSlang) {
    return `SLANG LEVEL: MATCH CUSTOMER VOICE
- The customer used casual internet phrasing in their note. Mirror that casualness naturally!
- Do not make it stiffer or formal. Keep it authentic to their wavelength without overdoing it.`;
  }

  switch (intensity) {
    case "low":
      return `SLANG LEVEL: SUBTLE / CLEAN CONVERSATIONAL
- Use standard, clean conversational English.
- Natural phrasing: "really liked", "pretty solid", "super good", "definitely coming back", "worth checking out".
- DO NOT use internet acronyms or slang like "ngl", "lowkey", "hits", or "fire".`;

    case "high":
      return `SLANG LEVEL: INTERNET-NATIVE (Believable & Realistic)
- Use phrasing a young customer typing on Google Maps would naturally use (e.g. "ngl", "lowkey", "hits", "such a vibe", "so good").
- CRITICAL: Never stack multiple slang words in one sentence. Do NOT write caricature or parody dialogue.`;

    case "medium":
    default:
      return `SLANG LEVEL: BALANCED CONTEMPORARY (Default Natural Voice)
- Controlled natural slang: use at most 1-2 contemporary conversational words if they fit organically ("vibe", "actually really good", "kinda", "super", "pretty solid").
- Do NOT force slang. If the review sounds better with plain conversational English, choose natural simplicity.`;
  }
}

export function buildReviewPrompt(data: FeedbackData): PromptBuildResult {
  const intensity: SlangIntensity = data.slang_intensity || "medium";
  const sentiment = analyzeSentiment(data);
  const highlight = (data.highlight || "").trim();
  const comment = (data.comment || "").trim();

  const { hasCustomerSlang } = detectCustomerVoiceProfile(comment);
  const slangGuidance = getSlangDistributionGuidance(intensity, hasCustomerSlang);

  // Pick a random cadence to ensure sentence rhythm and structural diversity
  const cadence = CADENCE_PROFILES[Math.floor(Math.random() * CADENCE_PROFILES.length)];

  // Pick diverse opening instructions so every review doesn't start identically
  const openingStyles = [
    "OPENING: Start directly with the standout highlight or what was ordered.",
    "OPENING: Start with an overall atmosphere or venue impression.",
    "OPENING: Start with a candid, direct takeaway.",
    "OPENING: Avoid starting with 'Honestly', 'I recently visited', or 'This place'. Start straight in.",
  ];
  const openingDirective = openingStyles[Math.floor(Math.random() * openingStyles.length)];

  const systemInstruction = `You are a real customer typing a quick, authentic Google Maps review on your mobile phone based strictly on your ratings and notes.
You write like an actual young person: casual, first-person ("I", "my"), natural, concise, and human.

NON-NEGOTIABLE PRINCIPLES:
1. NEVER SOUND LIKE AN AI OR CORPORATE PR: Avoid phrases like "culinary delight", "exceptional service", "highly recommend to all", "testament to", "nestled in", or "exceeded expectations".
2. ZERO CRINGE / PARODY: NEVER use "fr fr", "no cap", "ong", "bussin", "slayed", "ate and left no crumbs", or "fire af" unless the customer explicitly wrote them in their comment.
3. STRICT FACTUAL GROUNDING: Rely ONLY on the ratings, highlight, and notes provided. NEVER invent dishes, beverages, ingredients, prices, wait times, staff names, or events not mentioned by the customer.
4. HONEST SENTIMENT FIDELITY: Never invert sentiment. Negative stays negative, mixed stays mixed, positive stays positive.
5. LENGTH & FORMAT: 35 to 80 words (2 to 5 sentences). Plain review text ONLY. No quotation marks, no headers, no "Review:", and NO EMOJIS by default.`;

  const prompt = `Write an authentic, human Google Maps review based on this customer's feedback:

CUSTOMER RATINGS & INPUTS:
- Food & Drinks: ${SCORE_LABELS[data.food] || `${data.food}/5`}
- Service: ${SCORE_LABELS[data.service] || `${data.service}/5`}
- Ambience: ${SCORE_LABELS[data.ambience] || `${data.ambience}/5`}
- Value for Money: ${SCORE_LABELS[data.value] || `${data.value}/5`}
- Overall Experience: ${SCORE_LABELS[data.overall] || `${data.overall}/5`}
- Standout Highlight: ${highlight ? highlight : "None specified"}
- Customer's Own Note: ${comment ? `"${comment}"` : "None provided"}

DIRECTIVES:
${sentiment.guidance}

${slangGuidance}

${cadence.instruction}

${openingDirective}

SENTENCE RHYTHM EXAMPLES (CALIBRATION):
- Bad AI Corporate: "I had the distinct pleasure of visiting this venue today. The culinary offerings were delectable and the ambience was lovely."
- Bad Cringe Parody: "Bro this coffee slapped fr fr no cap ong the vibes were immaculate af 🔥😭"
- Good Natural Casual (High Positive): "Really liked this place. The coffee was actually so good and the whole vibe was super chill. Service was quick too. Definitely coming back."
- Good Natural Casual (Mixed): "Food was pretty solid, but the service was kinda slow today ngl. Really liked the seating and overall vibe though."
- Good Natural Casual (Negative): "Really wanted to like this spot, but the food was cold and the staff seemed pretty rushed. Probably wouldn't come back."

OUTPUT REQUIREMENT:
Output the plain review text ONLY (35 to 80 words). No quotes, no intro text, no emojis.`;

  return {
    systemInstruction,
    prompt,
  };
}
