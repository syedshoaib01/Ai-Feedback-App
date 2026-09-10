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

- **Frontend & App Engine**: Next.js 15 (App Router, Server Components & Route Handlers)
- **Language**: TypeScript (Strict Mode) & Python 3.12
- **Styling**: Tailwind CSS & Modern CSS Design Tokens
- **Animations**: Motion for React (`motion/react`)
- **AI Integration**: Google Gemini API via official `@google/genai` (Node) & `google-genai` (Python)
- **Icons**: Lucide React
- **Alternative / Legacy Backend**: Python Flask (Application Factory, Blueprints, Unittests)

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

> **Security Note:** The `.env` file is strictly ignored by `.gitignore`. The Gemini API key remains securely on the backend and is never exposed to the client.

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

### 3. (Optional) Run Flask Backend

The Python Flask backend remains fully intact and organized with the Application Factory pattern:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run via entrypoint
python run.py
# or
python app.py
```

Open [http://127.0.0.1:5000](http://127.0.0.1:5000) in your browser.

### 4. Running Python Tests

```bash
python -m unittest discover -s tests -p "test_*.py" -v
```

---

## ☁️ Deployment on Vercel (Recommended)

1. Import your GitHub repository (`Ai-Feedback-App`) on [Vercel](https://vercel.com/new).
2. Vercel automatically detects the **Next.js** framework preset.
3. Under **Environment Variables**, configure:
   - `GEMINI_API_KEY`: Your Gemini API key from Google AI Studio
   - `GEMINI_MODEL`: `gemini-3.5-flash` (or your chosen Gemini model)
   - `GOOGLE_REVIEW_URL`: Direct Google Review link for your business
4. Click **Deploy**. Vercel will build and deploy the app with optimized edge caching and serverless AI review generation.

<details>
<summary>Alternative: Deployment on Render</summary>

1. Connect your GitHub repository (`Ai-Feedback-App`) to Render.
2. Create a new **Web Service** with Node environment:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
3. Under **Environment Variables**, set:
   - `NODE_VERSION`: `20.19.5`
   - `GEMINI_API_KEY`: Your Gemini API key
   - `GEMINI_MODEL`: `gemini-3.5-flash`
   - `GOOGLE_REVIEW_URL`: Your business's Google review URL
   - `NODE_ENV`: `production`

</details>

---

## 📁 Architecture Overview

```
reviewflow_mvp/
├── app/
│   ├── api/
│   │   ├── generate/route.ts   # Next.js Server-side Gemini generation route
│   │   └── config/route.ts     # Next.js public config (Google review URL, status)
│   ├── globals.css             # Tailwind tokens, slider styles, dark mode
│   ├── layout.tsx              # Root layout with fonts, metadata, theme script
│   ├── manifest.ts             # PWA metadata
│   ├── page.tsx                # Main ReviewFlow app view
│   ├── __init__.py             # Flask Application Factory (create_app)
│   ├── config.py               # Flask environment configs
│   ├── routes/                 # Flask blueprints (api.py, web.py)
│   ├── services/               # Flask services (gemini_service.py)
│   └── utils/                  # Flask validators
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
├── run.py                      # Flask runner
├── app.py                      # Flask shim entrypoint
├── requirements.txt            # Python dependencies
└── tests/                      # Python unit tests
```
