# ReviewFlow ⚡

> Turn genuine customer feedback into authentic, casual reviews powered by Google Gemini.

ReviewFlow is a production-quality, mobile-first web application designed for cafes, restaurants, and hospitality venues. Customers scan a QR code at their table or counter and complete a guided 20–30 second feedback questionnaire across 5 satisfaction categories, select standout highlights, and optionally add their own notes.

Using **Google Gemini** via the official `@google/genai` TypeScript SDK, ReviewFlow synthesizes these inputs into an authentic, natural first-person review matching modern conversational speech (Gen Z / casual tone) without inventing facts or distorting sentiment. Customers remain the authors — they can edit the draft, copy it with one tap, and continue directly to the business's Google review dialog.

---

## ✨ Key Features

- **Mobile-First & Tactile UX**: Optimized for 320px to 430px+ mobile screens, safe-area insets (`100dvh`), thumb-friendly tap targets (>= 44px), zero horizontal overflow.
- **Visual/Tactile Rating Sliders**: Smooth thumb movement, scale-on-drag visual feedback, tap-to-position, keyboard navigation, and dynamic reaction badges (*Loved it!*, *Really good*, *Pretty good*, *Could be better*, *Not good*).
- **Calibrated Gen-Z Voice**: Natural, human conversational tone that avoids robotic corporate templates and cringe caricatures. Supports variable slang intensity (`LOW`, `MEDIUM`, `HIGH`; default `MEDIUM`).
- **Zero Hallucination Policy**: Grounded strictly in customer feedback — never invents menu items, staff names, prices, or wait times not mentioned by the customer.
- **Strict Sentiment Fidelity**: Positive stays positive, mixed stays mixed, and critical stays critical.
- **Editable Draft Card**: Customer can tweak wording with one tap in a responsive textarea.
- **One-Tap Copy & Google CTA**: One-tap copy with visual confirmation and direct link to the venue's Google Reviews page.
- **Light & Dark Mode**: Thoughtfully designed themes (warm cafe paper/cream in light mode, deep obsidian slate in dark mode) with system preference persistence.
- **Server-Side Security**: Gemini API key remains strictly on the server and is never exposed to client browsers. Includes sliding-window abuse rate limiting and payload size guards.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components & Route Handlers)
- **Language**: TypeScript 5 (Strict Mode)
- **AI Engine**: Google Gemini API via official `@google/genai` SDK (`gemini-3.5-flash`)
- **Validation**: Zod schema validation
- **Styling**: Tailwind CSS & CSS variable design tokens
- **Animations**: Motion for React (`motion/react`)
- **Icons**: Lucide React
- **Testing**: Vitest automated test suite

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
# Supported models: gemini-3.5-flash, gemini-3.6-flash, gemini-3.8-flash
GEMINI_MODEL=gemini-3.5-flash

# Direct Google Review URL for your business
GOOGLE_REVIEW_URL=https://www.google.com/search?q=your+business+name#lrd=...
```

> **Security Note:** The `.env` file is strictly ignored by `.gitignore`. The Gemini API key remains securely on the backend and is never exposed to the client.

### 2. Install & Run Next.js

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

### 3. Run Automated Tests

```bash
npm test
```

---

## ☁️ Deployment on Vercel (Optimized)

ReviewFlow is optimized for zero-config deployment on [Vercel](https://vercel.com):

1. Import your GitHub repository (`syedshoaib01/Ai-Feedback-App`) on Vercel.
2. Vercel automatically detects the **Next.js** framework preset.
3. Under **Settings > Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Gemini API key from Google AI Studio (marked sensitive/encrypted)
   - `GEMINI_MODEL`: `gemini-3.5-flash` (or your preferred model)
   - `GOOGLE_REVIEW_URL`: Direct Google Review link for your business
4. Deploy! Vercel automatically deploys the App Router routes as serverless functions with global edge caching and automatic SSL.

---

## 📁 Architecture

```
reviewflow_mvp/
├── app/
│   ├── api/
│   │   ├── generate/route.ts   # POST: Validate, rate-limit, generate review with Gemini
│   │   ├── health/route.ts     # GET: Status, active model, configuration check
│   │   └── config/route.ts     # GET: Safe public client config
│   ├── globals.css             # Tailwind tokens, slider styles, dark mode
│   ├── layout.tsx              # Root layout with Plus Jakarta Sans, metadata, theme script
│   ├── manifest.ts             # PWA metadata
│   └── page.tsx                # Main ReviewFlow questionnaire view
├── components/
│   ├── ui/                     # Button, Card, Chip, ProgressBar, ThemeToggle
│   ├── feedback/               # RatingSlider, StepQuestion, HighlightsStep, FeedbackFlow
│   └── review/                 # ReviewGenerating, ReviewResult
├── lib/
│   ├── gemini/
│   │   ├── client.ts           # Official @google/genai client and secret redaction
│   │   ├── prompt.ts           # Gen-Z prompt engineering with slang intensity & sentiment
│   │   └── generate-review.ts  # Core generation orchestrator and error mapper
│   ├── validation/
│   │   └── feedback.ts         # Zod schema validation & input sanitizer
│   ├── security/
│   │   └── rate-limit.ts       # In-memory sliding-window rate limiter & payload guard
│   ├── constants.ts            # Categories, descriptors, highlight tags
│   ├── types.ts                # TypeScript interfaces
│   └── utils.ts                # cn merger and safe haptic utilities
├── types/
│   ├── feedback.ts             # Feedback ratings, data, and intensity types
│   └── review.ts               # API response and configuration interfaces
└── tests/
    ├── validation.test.ts      # Payload verification, boundary checks, and conversions
    ├── prompt.test.ts          # Sentiment preservation and slang intensity steering
    ├── rate-limit.test.ts      # Request rate-limiting tests
    └── gemini.test.ts          # Configuration and secret redaction tests
```
