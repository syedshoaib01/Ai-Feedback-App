import { FeedbackData, SlangIntensity } from "@/types/feedback";
import { SCORE_LABELS } from "@/lib/constants";

export interface PromptBuildResult {
  systemInstruction: string;
  prompt: string;
}

function analyzeSentiment(data: FeedbackData): {
  tier: "high_positive" | "mixed" | "negative";
  guidance: string;
} {
  const scores = [data.food, data.service, data.ambience, data.value, data.overall];
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const overall = data.overall;

  const hasLow = scores.some((s) => s <= 2);
  const hasHigh = scores.some((s) => s >= 4);

  if (overall <= 2 || avg < 2.5) {
    return {
      tier: "negative",
      guidance:
        "CRITICAL/NEGATIVE SENTIMENT: The customer had an unsatisfactory experience. The review must sound candid, disappointed, and direct. DO NOT sugarcoat, DO NOT make it cheerful, and DO NOT invert their dissatisfaction into praise.",
    };
  }

  if ((hasLow && hasHigh) || (overall === 3 && avg <= 3.8)) {
    return {
      tier: "mixed",
      guidance:
        "MIXED SENTIMENT: The customer experienced a mix of good and bad aspects (e.g. food was good but service/value was lacking, or vice versa). You MUST mention both the positive and the negative sides honestly. Do not make it sound completely positive or completely negative.",
    };
  }

  return {
    tier: "high_positive",
    guidance:
      "HIGH POSITIVE SENTIMENT: The customer had a great time. The tone should be warm, enthusiastic, and appreciative without sounding like a paid commercial.",
  };
}

function getSlangGuidance(intensity: SlangIntensity): string {
  switch (intensity) {
    case "low":
      return `SLANG INTENSITY: LOW
- Use clean, standard conversational English with subtle casual phrasing.
- Examples of natural phrasing: "really liked", "pretty solid", "super good", "worth it", "definitely coming back".
- Avoid internet shorthand like "ngl", "lowkey", or "hits".`;

    case "high":
      return `SLANG INTENSITY: HIGH (Still Believable & Natural)
- Use internet-native casual phrasing that a young person would naturally type.
- May include phrases like: "ngl", "lowkey", "hits", "such a chill vibe", "fire", "obsessed".
- CRITICAL RULE: NEVER stack multiple slang terms in one sentence. Do NOT write caricature or parody.`;

    case "medium":
    default:
      return `SLANG INTENSITY: MEDIUM (Default Natural Voice)
- Conversational, natural phrasing with 1-2 subtle Gen-Z/contemporary expressions where they genuinely fit.
- Natural words: "vibe", "vibes", "pretty solid", "actually", "kinda", "super", "chill", "loved it".
- Keep it smooth and natural. Authenticity always comes first before slang.`;
  }
}

export function buildReviewPrompt(data: FeedbackData): PromptBuildResult {
  const intensity: SlangIntensity = data.slang_intensity || "medium";
  const sentiment = analyzeSentiment(data);
  const slangGuidance = getSlangGuidance(intensity);

  const highlight = (data.highlight || "").trim();
  const comment = (data.comment || "").trim();

  // Pick one of several natural opening cues to ensure variety across generations
  const openingVariations = [
    "Vary your opening naturally. You may start directly with what stood out, an overall impression, or a casual remark.",
    "Do NOT always start with 'Honestly' or 'Lowkey'. Start with the atmosphere, the food, or a direct takeaway.",
    "Keep the sentence rhythm varied and effortless, like a quick text to a friend or a 30-second Google review.",
  ];
  const openingCue = openingVariations[Math.floor(Math.random() * openingVariations.length)];

  const systemInstruction = `You are a real customer drafting an authentic Google Maps review based strictly on your ratings and personal notes.
You write like a real young person casually typing on their phone: conversational, concise, first-person ("I", "my"), and human.

Tone & Style Rules:
- NEVER sound corporate, formal, or like a PR brochure (avoid "culinary excellence", "testament to", "delightful establishment", "look no further").
- NEVER write parody or cringe caricature ("slapped fr fr no cap ong").
- NEVER force slang if it feels unnatural.
- Write in 2 to 5 sentences (40 to 90 words).
- Output plain review text ONLY. No introductory remarks (NEVER say "Here is your review:"), no quotes around the review, no hashtags, and NO EMOJIS unless the customer typed emojis in their comment.
- STRICT FACTUAL GROUNDING: Rely ONLY on the ratings, highlight, and comment provided. NEVER invent specific menu items, drinks, prices, wait times, staff names, locations, or experiences that the customer did not mention.`;

  const prompt = `Draft a natural Google Maps review reflecting this customer's ratings:

Customer Ratings & Notes:
- Food & Drinks: ${SCORE_LABELS[data.food] || `${data.food}/5`}
- Service: ${SCORE_LABELS[data.service] || `${data.service}/5`}
- Ambience: ${SCORE_LABELS[data.ambience] || `${data.ambience}/5`}
- Value for Money: ${SCORE_LABELS[data.value] || `${data.value}/5`}
- Overall Experience: ${SCORE_LABELS[data.overall] || `${data.overall}/5`}
- Standout Highlight: ${highlight ? highlight : "None specified"}
- Customer's Note: ${comment ? `"${comment}"` : "None provided"}

Style & Tone Directives:
${sentiment.guidance}

${slangGuidance}

${openingCue}

Voice Calibration Examples:
- BAD (Corporate AI): "I had the distinct pleasure of visiting this venue today. The culinary offerings were exceptionally delectable and the service was commendable."
- BAD (Cringe Parody): "Ngl bro this place was fire fr, the vibes were immaculate af and the coffee absolutely slapped 🔥😭"
- GOOD (High Positive): "Honestly such a nice spot. The coffee was actually really good and the atmosphere was super chill. Definitely coming back next time I'm around."
- GOOD (Mixed): "Food was pretty solid, but the service was kinda slow today ngl. Really liked the seating and overall vibe though."
- GOOD (Negative): "Really wanted to like this spot, but the food was cold and the staff seemed pretty rushed. Probably wouldn't come back."

Remember:
- Plain text review ONLY.
- 40 to 90 words.
- Accurate sentiment.
- No invented facts.
- No emojis.`;

  return {
    systemInstruction,
    prompt,
  };
}
