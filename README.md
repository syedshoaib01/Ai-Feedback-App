# ReviewFlow ⚡

> Turn genuine customer feedback into authentic, casual reviews powered by Google Gemini.

ReviewFlow is a production-quality, mobile-first web application designed for cafes and restaurants. Customers can scan a QR code at their table or counter and complete a guided 20–30 second feedback questionnaire across 5 satisfaction categories, select highlights, and add notes.

Using **Google Gemini**, ReviewFlow drafts an authentic, natural first-person review matching real customer speech (Gen Z / conversational tone) without inventing facts or distorting sentiment. Customers remain the genuine author — they can edit the draft, copy it with one tap, and continue directly to the restaurant's Google review page.

---

## ✨ Key Features

- **Guided & All-in-One Experience**: Smooth 6-step questionnaire with dynamic animated progress (`01 / 06`) or single-page view.
- **Premium Rating Sliders**: Smooth thumb movement, touch dragging, tap-to-position, keyboard accessibility, and dynamic contextual reaction badges (*Loved it!*, *Really good*, *Pretty good*, *Could be better*, *Not good*).
- **Zero Hallucination Policy**: Grounded strictly in customer feedback — never invents menu items, staff names, prices, or events.
- **Strict Sentiment Fidelity**: Positive stays positive, mixed stays mixed, and critical stays critical.
- **Branded AI Generation Experience**: Engaging, lightweight loading state with live status captions.
- **Editable Draft Card**: Customer can tweak wording with one tap.
- **One-Tap Copy & Google CTA**: Tactile copy button with confirmation and prominent "Continue to Google Reviews →" link.
- **Light & Dark Mode**: Thoughtfully designed themes (warm cafe paper/cream in light mode, deep obsidian/slate in dark mode) with smooth Sun/Moon toggle and system preference persistence.
- **Mobile-First & PWA Ready**: Optimized for 320px to 430px+ screens, safe-area insets (`100dvh`), thumb-friendly tap targets (>= 44px), zero horizontal overflow.
- **Server-Side Security**: Gemini API key remains strictly on the server and is never exposed to client browsers.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components & Route Handlers)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS & Modern CSS Design Tokens
- **Animations**: Motion for React (`motion/react`)
- **AI Integration**: Google Gemini API via official `@google/genai` SDK
- **Icons**: Lucide React
- **Legacy Backend (Preserved)**: Python Flask (`app.py`), `google-genai`

---

## 🚀 Quickstart Guide

### 1. Configure Environment Variables

Create a `.env` file in the root directory (or copy from `.env.example`):

```bash
cp .env.example .env
```

Set your values:

```env
# Google Gemini API key from Google AI Studio (Server-side only)
GEMINI_API_KEY=your_gemini_api_key_here

# (Optional) Gemini model (default: gemini-3.5-flash)
GEMINI_MODEL=gemini-3.5-flash

# Direct Google Review URL for your business (from Google Maps or Business Profile)
GOOGLE_REVIEW_URL=https://www.google.com/search?q=your+business+name#lrd=...
```

### 2. Install & Run Next.js (Modern Production App)

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Or build and run production server
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. (Optional) Run Legacy Flask App

The original Python Flask backend remains fully intact and functional:

```bash
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Open [http://127.0.0.1:5000](http://127.0.0.1:5000) in your browser.

---

## ☁️ Deployment on Render

### Single Web Service (Recommended)

1. Connect your GitHub repository (`Ai-Feedback-App`) to Render.
2. Create a new **Web Service**:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
3. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Gemini API key
   - `GEMINI_MODEL`: `gemini-3.5-flash`
   - `GOOGLE_REVIEW_URL`: Your business's Google review URL
   - `NODE_ENV`: `production`

---

## 📁 Architecture Overview

```
reviewflow_mvp/
├── app/
│   ├── api/
│   │   ├── generate/route.ts   # Server-side Gemini generation route
│   │   └── config/route.ts     # Public config (Google review URL, model status)
│   ├── globals.css             # Tailwind tokens, slider styles, dark mode
│   ├── layout.tsx              # Root layout with fonts, metadata, theme script
│   ├── manifest.ts             # PWA metadata
│   └── page.tsx                # Main ReviewFlow app view
├── components/
│   ├── ui/                     # Button, Card, Chip, ProgressBar, ThemeToggle
│   ├── feedback/               # RatingSlider, StepQuestion, HighlightsStep, FeedbackFlow
│   └── review/                 # ReviewGenerating, ReviewResult
├── hooks/
│   ├── useTheme.ts             # Theme state & localStorage persistence
│   └── useFeedbackFlow.ts      # Multi-step state machine
├── lib/
│   ├── api.ts                  # Typed client for /api/generate
│   ├── constants.ts            # Categories, descriptors, style guides
│   ├── gemini.ts               # Server-side Google GenAI client & prompt
│   ├── types.ts                # TypeScript interfaces
│   └── utils.ts                # Utility functions & tactile haptics
├── app.py                      # Preserved legacy Flask backend
└── requirements.txt            # Preserved Python dependencies
```
