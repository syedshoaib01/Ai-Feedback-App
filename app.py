import os
import random
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from google import genai

# Load environment variables reliably from the directory of this file
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

app = Flask(__name__)

GOOGLE_REVIEW_URL = os.getenv("GOOGLE_REVIEW_URL", "").strip()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash").strip()

SCORE_LABELS = {
    1: "Very dissatisfied (1/5)",
    2: "Dissatisfied (2/5)",
    3: "Okay / Average (3/5)",
    4: "Satisfied / Good (4/5)",
    5: "Very satisfied / Excellent (5/5)"
}

SLANG_STYLE_GUIDES = [
    "Style: Casual & natural conversational tone. Clean and simple with zero to one slang expression.",
    "Style: Light Gen Z / contemporary casual voice. Use 1-2 natural terms like 'vibes', 'pretty solid', 'actually', or 'super'.",
    "Style: Internet-native casual voice. Spontaneous and authentic using 2-3 phrases like 'fire', 'lowkey', 'worth it', or 'immaculate' where fitting.",
    "Style: Relaxed conversational tone. Focus on effortless phrasing, varied rhythm, and casual sincerity."
]

def generate_with_gemini(data):
    """Generates a natural, Gen Z / casual first-person review using the google-genai SDK."""
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set.")

    food_score = int(data.get("food", 5))
    service_score = int(data.get("service", 5))
    ambience_score = int(data.get("ambience", 5))
    value_score = int(data.get("value", 5))
    overall_score = int(data.get("overall", 5))
    highlight = str(data.get("highlight", "")).strip()
    comment = str(data.get("comment", "")).strip()

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

    client = genai.Client(api_key=GEMINI_API_KEY)
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
    )

    review_text = (response.text or "").strip()
    # Strip accidental wrapping quotes if the model added them
    if review_text.startswith('"') and review_text.endswith('"'):
        review_text = review_text[1:-1].strip()
    if review_text.startswith("'") and review_text.endswith("'"):
        review_text = review_text[1:-1].strip()

    return review_text

@app.get("/")
def index():
    return render_template(
        "index.html",
        google_review_url=GOOGLE_REVIEW_URL,
        gemini_configured=bool(GEMINI_API_KEY)
    )

@app.post("/api/generate")
def generate():
    data = request.get_json(silent=True) or {}

    # Validate the 5 required category sliders
    required_fields = ["food", "service", "ambience", "value", "overall"]
    missing = [f for f in required_fields if f not in data or data[f] is None or data[f] == ""]
    if missing:
        return jsonify({
            "error": "Please rate all five categories on the sliders (Food, Service, Ambience, Value, Overall)."
        }), 400

    # Ensure scores are valid integers between 1 and 5
    for field in required_fields:
        try:
            val = int(data[field])
            if not (1 <= val <= 5):
                raise ValueError()
        except (ValueError, TypeError):
            return jsonify({
                "error": f"Rating for {field.capitalize()} must be between 1 and 5."
            }), 400

    if not GEMINI_API_KEY:
        print("[ReviewFlow] Gemini request failed: GEMINI_API_KEY not configured.")
        return jsonify({
            "error": "GEMINI_API_KEY is not configured in .env. Please set GEMINI_API_KEY.",
            "source": "error"
        }), 503

    try:
        print("[ReviewFlow] Gemini request started")
        review = generate_with_gemini(data)
        print("[ReviewFlow] Gemini request succeeded")

        return jsonify({
            "review": review,
            "source": "Gemini",
            "google_review_url": GOOGLE_REVIEW_URL
        })
    except Exception as exc:
        # Safe error logging without exposing sensitive keys or credentials
        err_type = type(exc).__name__
        err_msg = str(exc)
        # Sanitize any accidental key leak in error text
        if GEMINI_API_KEY and GEMINI_API_KEY in err_msg:
            err_msg = err_msg.replace(GEMINI_API_KEY, "[REDACTED]")

        print(f"[ReviewFlow] Gemini request failed: ({err_type}) {err_msg}")

        return jsonify({
            "error": "Gemini couldn't generate the review. Please try again.",
            "details": f"{err_type}: {err_msg[:160]}",
            "source": "error",
            "google_review_url": GOOGLE_REVIEW_URL
        }), 502

if __name__ == "__main__":
    app.run(debug=True, port=5000)
