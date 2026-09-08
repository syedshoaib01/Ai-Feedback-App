import logging
import random
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

SCORE_LABELS = {
    1: "Very dissatisfied (1/5)",
    2: "Dissatisfied (2/5)",
    3: "Okay / Average (3/5)",
    4: "Satisfied / Good (4/5)",
    5: "Very satisfied / Excellent (5/5)",
}

SLANG_STYLE_GUIDES = [
    "Style: Casual & natural conversational tone. Clean and simple with zero to one slang expression.",
    "Style: Light Gen Z / contemporary casual voice. Use 1-2 natural terms like 'vibes', 'pretty solid', 'actually', or 'super'.",
    "Style: Internet-native casual voice. Spontaneous and authentic using 2-3 phrases like 'fire', 'lowkey', 'worth it', or 'immaculate' where fitting.",
    "Style: Relaxed conversational tone. Focus on effortless phrasing, varied rhythm, and casual sincerity.",
]


class GeminiServiceError(Exception):
    """Exception raised when review generation fails."""
    pass


class GeminiConfigError(GeminiServiceError):
    """Exception raised when Gemini is not configured properly."""
    pass


def build_review_prompt(data: Dict[str, Any], style_variation: Optional[str] = None) -> str:
    """Builds a structured prompt grounded purely in customer feedback."""
    food_score = int(data.get("food", 5))
    service_score = int(data.get("service", 5))
    ambience_score = int(data.get("ambience", 5))
    value_score = int(data.get("value", 5))
    overall_score = int(data.get("overall", 5))
    highlight = str(data.get("highlight", "")).strip()
    comment = str(data.get("comment", "")).strip()

    if not style_variation:
        style_variation = random.choice(SLANG_STYLE_GUIDES)

    prompt = f"""You are drafting a real customer's review for a cafe or restaurant based strictly on their actual feedback ratings and notes.

Target Voice:
- First-person perspective ("I", "my").
- Casual, authentic Gen Z / internet-native conversational style (like someone casually typing a Google Maps review on their phone or telling a friend).
- {style_variation}
- Words that can be used naturally if they fit the sentiment: "vibe", "vibes", "pretty solid", "kinda", "super", "actually", "honestly", "worth it", "chill", "fire", "a lil", "lowkey", "loved this".
- NEVER force slang. Naturalness and authenticity ALWAYS trump slang. Do not create a parody or caricature of Gen Z speech.
- Vary your opening sentences. Do NOT predictably begin with "Lowkey...", "Ngl...", "Honestly...", or "I really enjoyed...".

Strict Rules:
1. FACTUAL GROUNDING: Rely ONLY on the customer's provided ratings, highlight, and comments. NEVER invent specific food/drink items, staff names, prices, wait times, locations, or experiences that the customer did not mention.
2. SENTIMENT FIDELITY: Accurately reflect the customer's sentiment.
   - If they gave high scores (4-5), keep it positive and enthusiastic.
   - If feedback is mixed (e.g. food 5, service 2), reflect both the good food and the slow/poor service honestly without sugarcoating or turning it positive.
   - If scores are low (1-2), keep the review genuinely critical and dissatisfied.
3. CUSTOMER COMMENT INTEGRATION: If the customer left a specific comment, integrate their exact points and let their wording naturally guide the tone.
4. LENGTH: Keep it between 35 and 80 words.
5. FORMATTING: Output plain review text ONLY. No quotation marks around the review. No intro or outro text. No hashtags. No emojis unless the customer included emojis in their comment.

Customer Feedback:
- Food & Drinks: {SCORE_LABELS.get(food_score, f"{food_score}/5")}
- Service: {SCORE_LABELS.get(service_score, f"{service_score}/5")}
- Ambience: {SCORE_LABELS.get(ambience_score, f"{ambience_score}/5")}
- Value for Money: {SCORE_LABELS.get(value_score, f"{value_score}/5")}
- Overall Experience: {SCORE_LABELS.get(overall_score, f"{overall_score}/5")}
- Highlight of the visit: {highlight if highlight else "None specified"}
- Customer's own words: {comment if comment else "None provided"}
"""
    return prompt


class GeminiService:
    """Service handling interactions with the Google Gemini API."""

    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-3.5-flash"):
        self.api_key = (api_key or "").strip()
        self.model = (model or "gemini-3.5-flash").strip()
        self._client = None

    @property
    def is_configured(self) -> bool:
        """Checks if the service has an API key configured."""
        return bool(self.api_key)

    def _get_client(self):
        """Initializes and returns the google-genai Client."""
        if not self.is_configured:
            raise GeminiConfigError("GEMINI_API_KEY is not configured in .env. Please set GEMINI_API_KEY.")

        if self._client is None:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
            except ImportError as err:
                raise GeminiConfigError(
                    "The 'google-genai' package is not installed. Please run 'pip install google-genai'."
                ) from err
        return self._client

    def generate_review(self, data: Dict[str, Any]) -> str:
        """Generates a casual first-person review from customer feedback using Gemini."""
        client = self._get_client()
        prompt = build_review_prompt(data)

        try:
            logger.info("[ReviewFlow] Sending prompt to Gemini (%s)", self.model)
            response = client.models.generate_content(
                model=self.model,
                contents=prompt,
            )
            review_text = (getattr(response, "text", "") or "").strip()

            # Strip accidental quotes if model output was enclosed
            if review_text.startswith('"') and review_text.endswith('"'):
                review_text = review_text[1:-1].strip()
            elif review_text.startswith("'") and review_text.endswith("'"):
                review_text = review_text[1:-1].strip()

            if not review_text:
                raise GeminiServiceError("Received an empty response from Gemini.")

            logger.info("[ReviewFlow] Successfully generated review draft")
            return review_text

        except GeminiServiceError:
            raise
        except Exception as exc:
            err_type = type(exc).__name__
            err_msg = str(exc)

            # Redact API key from any error message if present
            if self.api_key and self.api_key in err_msg:
                err_msg = err_msg.replace(self.api_key, "[REDACTED]")

            logger.error("[ReviewFlow] Gemini API error: (%s) %s", err_type, err_msg)
            raise GeminiServiceError(f"{err_type}: {err_msg[:160]}") from exc
