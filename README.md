# ReviewFlow ⚡

> Turn genuine customer feedback into authentic, casual reviews powered by Google Gemini.

ReviewFlow is a production-quality, mobile-first web application designed for cafes, restaurants, and hospitality venues. Customers scan a QR code at their table or counter and complete a guided 20–30 second feedback questionnaire across 5 satisfaction categories, select standout highlights, and optionally add their own notes.

Using **Google Gemini** via the official `@google/genai` TypeScript SDK (`gemini-3.8-flash`), ReviewFlow synthesizes these inputs into authentic, natural first-person reviews matching modern conversational speech (Gen Z / casual tone) without inventing facts or distorting sentiment. Customers remain the authors — they can edit the draft, copy it with one tap, and continue directly to the business's Google review dialog.

---

## ✨ Key Features

- **Mobile-First & Tactile UX**: Optimized for 320px, 375px, 390px, and 430px+ mobile screens, safe-area insets (`pb-safe`, `100dvh`), thumb-friendly tap targets (>= 44px), zero horizontal overflow.
- **Psychologically Optimized Hierarchy**: Clear progressive disclosure (Context Pill → Large Primary Question → Large Reactive Rating Value → Tactile Slider → Action CTA) reducing cognitive load to the minimum.
- **Visual/Tactile Rating Sliders**: Smooth thumb movement, scale-on-drag visual feedback, tap-to-position, keyboard navigation, spring physics on release, and dynamic reaction badges (*Loved it!*, *Really good*, *Pretty good*, *Could be better*, *Not good*).
- **Subtle Haptics**: Short 8–15ms vibration pulses on discrete milestone commits (slider release, copy, submit) with automatic fallback and respect for `prefers-reduced-motion`.
- **Calibrated Gen-Z Voice**: Natural, human conversational tone that avoids robotic corporate templates and cringe caricatures (`fr fr`, `no cap`, `bussin`). Uses 4 rotating cadence profiles (`punchy_fragmented`, `conversational_smooth`, `observant_candid`, `casual_spoken`) and mirrors customer phrasing.
- **Zero Hallucination Policy**: Grounded strictly in customer feedback — never invents menu items, staff names, prices, or wait times not mentioned by the customer.
- **Strict Sentiment Fidelity**: Positive stays positive, mixed stays mixed, and critical stays critical across 5 distinct sentiment tiers.
- **Distributed Redis Rate Limiting**: Powered by `@upstash/ratelimit` and `@upstash/redis` with `Redis.fromEnv()` for multi-instance Vercel serverless protection (15 requests / 10 minutes per IP). Required in production; in local development, automatically falls back to an in-memory sliding window.
- **Restaurant Configuration Architecture**: Clean `/r/[restaurantSlug]` dynamic routing supporting custom venue names, logos, highlights, themes, and Google Review URLs without requiring a database.
- **Privacy-First Analytics Event Boundaries**: Telemetry points (`question_viewed`, `rating_selected`, `generation_started`, `generation_success`, `review_copied`, `google_cta_clicked`) that strictly omit PII and never persist customer review drafts.
- **PWA Ready**: Standalone app manifest and dynamic Next.js 15 metadata icons (`/icon`, `/apple-icon`).
- **Server-Side Security**: Gemini API key remains strictly on the server and is never exposed to client browsers.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components & Route Handlers)
- **Language**: TypeScript 5 (Strict Mode)
- **AI Engine**: Google Gemini API via official `@google/genai` SDK (`gemini-3.8-flash`)
- **Rate Limiting**: `@upstash/ratelimit` & `@upstash/redis` (15 req / 10m per IP, required in production; dev in-memory fallback)
- **Validation**: Zod schema validation
- **Styling**: Tailwind CSS & CSS variable design tokens
- **Animations**: Motion for React (`motion/react`)
- **Icons**: Lucide React
- **Testing**: Vitest automated test suite & 20-case prompt evaluation matrix

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

# Gemini Model variant (Default: gemini-3.8-flash)
GEMINI_MODEL=gemini-3.8-flash

# Direct Google Review URL for your business
GOOGLE_REVIEW_URL=https://www.google.com/search?q=your+business+name#lrd=...

# Upstash Redis for distributed rate limiting (Required in production)
# In local development (NODE_ENV !== "production"), falls back to in-memory sliding window if omitted
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

> **Security Note:** The `.env` file is strictly ignored by `.gitignore`. The Gemini API key and Redis credentials remain securely on the backend and are never exposed to the client.

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

Open [http://localhost:3000](http://localhost:3000) or test a venue at [http://localhost:3000/r/cafe-example](http://localhost:3000/r/cafe-example).

### 3. Run Automated Tests & Prompt Evaluation Matrix

```bash
# Run unit tests
npm test

# Run ESLint
npm run lint

# Run live 20-case Prompt Evaluation Matrix
npx tsx scripts/eval-prompt-matrix.ts
```

---

## 🛡️ Production Rate Limiting (Upstash Redis)

ReviewFlow protects the Gemini generation API with production-grade distributed rate limiting:

- **Production Requirement**: Upstash Redis is **required in production**. Stateless Vercel serverless functions do not share memory across instances; distributed Redis coordinates request counts globally.
- **Production Limit**: **15 requests per 10 minutes per client IP** (`Ratelimit.slidingWindow(15, "10m")`).
- **Required Environment Variables**:
  - `UPSTASH_REDIS_REST_URL`: Your Upstash Redis REST database URL.
  - `UPSTASH_REDIS_REST_TOKEN`: Your Upstash Redis REST authentication token.
- **Development Fallback**: In local development (`NODE_ENV !== "production"`), ReviewFlow automatically falls back to an in-memory sliding window if Upstash credentials are not present. In production, missing Upstash configuration fails explicitly with HTTP 500 to prevent silent, unprotected traffic bypasses.
- **Client IP Resolution**: Evaluates `x-forwarded-for`, `x-real-ip`, and `cf-connecting-ip` headers, returning standard `429 Too Many Requests` with `Retry-After` and `X-RateLimit-*` response headers.

---

## ☁️ Deployment on Vercel (Production Ready)

ReviewFlow is optimized for zero-config deployment on [Vercel](https://vercel.com):

1. Import your GitHub repository (`syedshoaib01/Ai-Feedback-App`) on Vercel.
2. Vercel automatically detects the **Next.js** framework preset.
3. Under **Settings > Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Gemini API key from Google AI Studio (marked sensitive/encrypted)
   - `GEMINI_MODEL`: `gemini-3.8-flash`
   - `GOOGLE_REVIEW_URL`: Direct Google Review link for your business
   - `UPSTASH_REDIS_REST_URL`: Upstash Redis REST URL endpoint (Required in production)
   - `UPSTASH_REDIS_REST_TOKEN`: Upstash Redis REST token (Required in production)
4. Deploy! Vercel automatically deploys the App Router routes as serverless functions with global edge caching and automatic SSL.

---

## 📁 Architecture

```
reviewflow_mvp/
├── app/
│   ├── api/
│   │   ├── generate/route.ts       # POST: Validate, distributed rate-limit, generate review with Gemini
│   │   ├── health/route.ts         # GET: Status, active model, configuration check
│   │   └── config/route.ts         # GET: Safe public client config
│   ├── r/[restaurantSlug]/page.tsx # Dynamic venue-tailored feedback flow (/r/cafe-example)
│   ├── globals.css                 # Tailwind tokens, tactile slider styles, dark mode
│   ├── layout.tsx                  # Root layout with Plus Jakarta Sans, metadata, theme script
│   ├── manifest.ts                 # PWA metadata
│   ├── icon.tsx                    # Dynamic PNG favicon (ImageResponse)
│   ├── apple-icon.tsx              # Dynamic Apple touch icon (ImageResponse)
│   └── page.tsx                    # Main ReviewFlow questionnaire view
├── components/
│   ├── ui/                         # Button, Card, Chip, ProgressBar, ThemeToggle
│   ├── feedback/                   # RatingSlider, StepQuestion, HighlightsStep, FeedbackFlow, ProgressHeader
│   └── review/                     # ReviewGenerating, ReviewResult
├── lib/
│   ├── gemini/
│   │   ├── client.ts               # Official @google/genai client and secret redaction
│   │   ├── prompt.ts               # Gen-Z prompt engineering with rotating cadence & sentiment fidelity
│   │   └── generate-review.ts      # Core generation orchestrator, retry logic, and error mapper
│   ├── restaurant/
│   │   └── config.ts               # Restaurant configuration abstraction, registry, and defaults
│   ├── analytics/
│   │   └── events.ts               # Privacy-first analytics event boundaries (no PII, no review storage)
│   ├── validation/
│   │   └── feedback.ts             # Zod schema validation & input sanitizer
│   ├── security/
│   │   └── rate-limit.ts           # Upstash Redis rate limiter (15 req/10m) with dev in-memory fallback
│   ├── constants.ts                # Categories, descriptors, highlight tags
│   ├── types.ts                    # TypeScript interfaces
│   └── utils.ts                    # cn merger and safe haptic utilities (reduced-motion aware)
├── types/
│   ├── feedback.ts                 # Feedback ratings, data, and intensity types
│   └── review.ts                   # API response and configuration interfaces
└── tests/
    ├── validation.test.ts          # Payload verification, boundary checks, and conversions
    ├── prompt.test.ts              # Sentiment preservation, cadence, and voice mirroring tests
    ├── rate-limit.test.ts          # Distributed & in-memory rate-limiting tests
    ├── restaurant.test.ts          # Restaurant config & fallback tests
    ├── analytics.test.ts           # Telemetry boundaries and privacy assertions
    └── gemini.test.ts              # Configuration, model fallback, and secret redaction tests
```
