# ReviewFlow MVP ⚡

> Turn genuine customer feedback into authentic, casual reviews powered by Google Gemini.

ReviewFlow is a lightweight web application designed for cafes and restaurants. Customers can quickly rate their experience across 5 satisfaction categories, select highlights, and add notes. ReviewFlow then uses **Google Gemini** to turn their raw feedback into an authentic first-person review that matches real customer speech (Gen Z / casual conversational tone) without inventing facts or distorting sentiment.

The customer reviews and edits their draft, copies it with one tap, and continues directly to the restaurant's Google review page.

---

## ✨ Features

- **5 Satisfaction Sliders**: Fast, touch-friendly rating scale (1–5) for Food & Drinks, Service, Ambience, Value for Money, and Overall Experience.
- **Authentic Gen Z Voice Engine**: Powered by Google Gemini (`gemini-3.5-flash`), generating natural, conversational first-person reviews with variable slang intensity (*vibes*, *actually*, *pretty solid*, *kinda*, *super*, *fire*, *worth it*).
- **Strict Sentiment Fidelity**: Positive stays positive, mixed stays mixed, and negative stays negative. The customer remains the genuine author.
- **Zero Hallucination Policy**: Grounded strictly in customer feedback — never invents menu items, prices, staff names, or events.
- **Google Maps Integration**: Automatically provides a direct "Continue to Google →" button to post the review.
- **Transparent Diagnostics**: Safe backend logging without exposing API keys; user-friendly UI error notifications with retry actions.

---

## 🚀 Quickstart Guide

### 1. Clone & Setup Environment

```bash
git clone git@github.com:syedshoaib01/Ai-Feedback-App.git
cd Ai-Feedback-App

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
# Gemini API key from Google AI Studio
GEMINI_API_KEY=your_gemini_api_key_here

# (Optional) Specific Gemini model to use (default: gemini-3.5-flash)
GEMINI_MODEL=gemini-3.5-flash

# Direct Google Review URL for your business (from Google Business Profile or Maps)
GOOGLE_REVIEW_URL=https://www.google.com/search?q=your+cafe+name#lrd=...
```

> **Security Note:** The `.env` file is strictly ignored by `.gitignore`. The Gemini API key remains securely on the Python backend and is never exposed to the frontend browser.

### 3. Run the App

```bash
python app.py
```

Open [http://127.0.0.1:5000](http://127.0.0.1:5000) in your browser.

---

## 🛠️ Tech Stack

- **Backend**: Python 3, Flask
- **AI Integration**: Google Gemini API via official `google-genai` SDK
- **Frontend**: HTML5, Vanilla JavaScript, Custom CSS (Plus Jakarta Sans)
- **Environment**: `python-dotenv`
