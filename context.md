# ReviewFlow ⚡ — Architecture, Workflow & Context Specification

> **Comprehensive System & Context Document**  
> *Project*: ReviewFlow MVP  
> *Generated*: September 2026  
> *Primary Stack*: Next.js 15 (App Router, TypeScript, Tailwind CSS, Motion) & Python 3.12 Flask  
> *AI Engine*: Google Gemini (`@google/genai` & `google-genai`)

---

## 1. Executive Summary & Purpose

**ReviewFlow** is a mobile-first, QR-activated web application tailored for hospitality venues (cafes, restaurants, bakeries, bistros). It addresses the customer feedback drop-off problem: while customers frequently enjoy dining experiences, writing written online reviews is high-friction, resulting in low review volume or generic ratings.

ReviewFlow solves this by providing a **20–30 second interactive questionnaire** where customers rate 5 core experience dimensions, pick standout highlights, and optionally leave unstructured notes. Using **Google Gemini**, ReviewFlow synthesizes these inputs into an authentic, casual first-person review draft matching contemporary natural speech (conversational / light Gen Z tone). 

Crucially, the customer retains full authorship: they can tweak any text in an editable draft card, copy the finalized draft in one tap, and jump directly to the venue's Google Business review page to submit.

---

## 2. Non-Negotiable Core Policies

1. **Zero Hallucination Policy**:
   - The AI must rely strictly on customer-provided ratings, selected highlights, and submitted comments.
   - It is strictly forbidden from inventing dishes, beverages, staff names, price points, wait times, seating details, or events not mentioned by the customer.
2. **Strict Sentiment Fidelity**:
   - Sentiment is never inverted or sugarcoated.
   - High ratings (4–5/5) yield upbeat and enthusiastic drafts.
   - Mixed ratings (e.g., Food 5/5, Service 2/5) honestly present both facets (e.g., praising the food while noting the slow service).
   - Low ratings (1–2/5) result in direct, critical, and dissatisfied feedback.
3. **Customer as the Author**:
   - The generated review is presented as an editable draft in a textarea.
   - Customers can alter wording, add personal touches, or rewrite sentences before sharing.
4. **Server-Side Security**:
   - `GEMINI_API_KEY` is strictly managed server-side (Next.js Route Handlers / Flask backend) and is never sent to or exposed in client bundles.
   - Error messages automatically redact API keys and mask internal exception traces.

---

## 3. High-Level Architecture: The Dual-Stack Design

The repository contains a cohesive dual-stack architecture designed for modern production web deployment while preserving an alternative Python backend:

```
                               ┌────────────────────────┐
                               │  Customer Device (QR)  │
                               └───────────┬────────────┘
                                           │
                                           ▼
                   ┌────────────────────────────────────────────────┐
                   │               Next.js 15 Frontend              │
                   │ (App Router, React 19, Motion, Tailwind CSS)   │
                   └───────────────┬────────────────┬───────────────┘
                                   │                │
            Internal Next.js Route │                │ Optional HTTP Proxy
                   (Default Mode)  │                │ (USE_FLASK_BACKEND=true)
                                   ▼                ▼
     ┌───────────────────────────────┐    ┌───────────────────────────────┐
     │   Next.js Server API Route    │    │      Flask Python Service     │
     │     `app/api/generate`        │    │    `app/routes/api.py`        │
     │      (`@google/genai`)        │    │      (`google-genai`)         │
     └───────────────┬───────────────┘    └───────────────┬───────────────┘
                     │                                    │
                     └──────────────────┬─────────────────┘
                                        │
                                        ▼
                        ┌───────────────────────────────┐
                        │       Google Gemini API       │
                        │    (Model: gemini-3.5-flash)  │
                        └───────────────────────────────┘
```

### Stack Components:
1. **Primary Production Engine (Next.js 15)**:
   - **Framework**: Next.js 15 (App Router, Server Components & Route Handlers).
   - **Language**: TypeScript (Strict Mode).
   - **Styling**: Tailwind CSS with CSS variable design tokens for theme support.
   - **Animation**: Motion for React (`motion/react`).
   - **AI Client**: Official `@google/genai` Node SDK.
   - **Runtime**: Node.js `>=20.0.0`.
2. **Alternative / Legacy Engine (Python Flask)**:
   - **Framework**: Flask 3.1+ implementing the Application Factory pattern (`create_app`).
   - **Language**: Python 3.12.
   - **Structure**: Modular blueprints (`web_bp`, `api_bp`), dedicated services (`GeminiService`), and validator modules.
   - **Frontend**: Lightweight Jinja2 template (`templates/index.html`) with Vanilla JavaScript (`static/js/app.js`) and CSS (`static/css/style.css`).
   - **AI Client**: Official `google-genai` Python SDK.
   - **Testing**: Python `unittest` suite covering routes, services, and payload validation.
3. **Interoperability**:
   - The Next.js generation route (`lib/gemini.ts`) can either call the Gemini API directly (default) or proxy requests to the Flask backend when `USE_FLASK_BACKEND=true` and `FLASK_API_URL` are configured.

---

## 4. Complete Project Directory Structure

```
reviewflow_mvp/
├── .env.example               # Template for environment configuration
├── .gitignore                 # Excludes .env, node_modules, .next, venv, pycache
├── .nvmrc                     # Enforces Node.js version (20)
├── README.md                  # Project overview, quickstart, setup instructions
├── next.config.mjs            # Next.js bundler configuration & path aliases (@/*)
├── package.json               # Node.js dependencies and lifecycle scripts
├── postcss.config.mjs         # PostCSS plugins (Tailwind CSS, Autoprefixer)
├── tailwind.config.ts         # Design tokens, color palette, custom theme definitions
├── tsconfig.json              # TypeScript strict configuration
├── requirements.txt           # Python backend dependencies (Flask, google-genai, gunicorn)
├── render.yaml                # Render Blueprint infrastructure configuration
├── run.py                     # Flask development server runner
├── app.py                     # Flask root WSGI / import shim
│
├── app/                       # Dual Next.js App Router & Flask App Package
│   │
│   ├── [Next.js App Router]
│   ├── layout.tsx             # Root HTML layout, Plus Jakarta Sans font, theme init script
│   ├── page.tsx               # Main mobile-first page rendering Header & FeedbackFlow
│   ├── globals.css            # Tailwind base, slider resets, dark mode color tokens
│   ├── manifest.ts            # Web App Manifest / PWA metadata
│   └── api/
│       ├── config/
│       │   └── route.ts       # GET: Exposes public config (googleReviewUrl, hasGeminiKey, model)
│       └── generate/
│           └── route.ts       # POST: Validates feedback payload & invokes Gemini API
│   │
│   ├── [Flask Application Package]
│   ├── __init__.py            # Flask create_app factory & error handlers (404, 500)
│   ├── config.py              # Environment configs (Development, Testing, Production)
│   ├── routes/
│   │   ├── __init__.py        # Blueprint exports (web_bp, api_bp)
│   │   ├── api.py             # POST /api/generate & GET /api/health
│   │   └── web.py             # GET / (serves Jinja2 index.html)
│   ├── services/
│   │   ├── __init__.py        # Service exports
│   │   └── gemini_service.py  # GeminiService class, prompt builder, error handling
│   └── utils/
│       ├── __init__.py        # Utility exports
│       └── validators.py      # validate_feedback_payload: score range & length capping
│
├── components/                # React UI Component Hierarchy
│   ├── ui/                    # Reusable Design Primitives
│   │   ├── Button.tsx         # Polymorphic tactile button with variants, sizes & loader
│   │   ├── Card.tsx           # Glassmorphism container card
│   │   ├── Chip.tsx           # Selectable highlight pills with spring animations
│   │   ├── ProgressBar.tsx    # Animated progress bar and step counter (e.g. 02 / 06)
│   │   └── ThemeToggle.tsx    # Sun/Moon theme switcher (Light / Dark / System)
│   ├── feedback/              # Feedback Collection Components
│   │   ├── FeedbackFlow.tsx   # Master orchestrator switching between Guided & All-in-One view
│   │   ├── ProgressHeader.tsx # Top brand header with logo badge and theme switcher
│   │   ├── StepQuestion.tsx   # Step card for an individual category with Next/Back buttons
│   │   ├── RatingSlider.tsx   # Interactive rating slider (touch, drag, tap, keyboard accessible)
│   │   └── HighlightsStep.tsx # Step 6: Highlight chips, comment textarea & submit action
│   └── review/                # AI Review Presentation Components
│       ├── ReviewGenerating.tsx # Animated loading state with rotating captions & shimmer card
│       └── ReviewResult.tsx   # Final review card: textarea, copy button, Google CTA
│
├── hooks/                     # Custom React Hooks
│   ├── useFeedbackFlow.ts     # Finite state machine managing answers, steps, and API submission
│   └── useTheme.ts            # Handles light/dark/system theme sync & localStorage persistence
│
├── lib/                       # Shared Business Logic, Clients & Constants
│   ├── api.ts                 # Client-side HTTP fetch wrappers for /api/generate & /api/config
│   ├── constants.ts           # Categories, descriptors, emoji badges, highlight tags, slang styles
│   ├── gemini.ts              # Server-side Gemini client, prompt engineering, retry mechanism
│   ├── types.ts               # Core TypeScript interfaces & rating types
│   └── utils.ts               # cn() class merger and Web Vibration API haptics
│
├── templates/                 # Flask HTML Templates
│   └── index.html             # Full-featured standalone HTML5 questionnaire UI
├── static/                    # Flask Static Assets
│   ├── css/
│   │   └── style.css          # Vanilla CSS design system for Flask UI
│   └── js/
│       └── app.js             # Vanilla JS DOM controller, slider sync & fetch client
│
└── tests/                     # Python Test Suite
    ├── __init__.py
    ├── test_routes.py         # Tests for Flask index, health, and generate endpoints
    ├── test_services.py       # Tests for prompt builder and Gemini service configuration
    └── test_validators.py     # Tests for payload verification, score bounds, and string limits
```

---

## 5. End-to-End User Experience & Flow

### Step-by-Step Questionnaire Walkthrough

```
[ Step 1: Food & Drinks ] ──► [ Step 2: Service ] ──► [ Step 3: Ambience ]
                                                               │
┌──────────────────────────────────────────────────────────────┘
▼
[ Step 4: Value for Money ] ──► [ Step 5: Overall ] ──► [ Step 6: Highlights & Note ]
                                                               │
┌──────────────────────────────────────────────────────────────┘
▼
[ Loading State (ReviewGenerating) ] ──► [ Result View (ReviewResult) ]
  • Shimmer skeleton                      • Editable textarea draft
  • Rotating captions                     • One-tap copy with haptic confirmation
                                          • CTA: "Continue to Google Reviews →"
```

1. **Category Sliders (Steps 1–5)**:
   - Evaluates: **Food & Drinks**, **Service**, **Ambience**, **Value for Money**, **Overall Experience**.
   - Discrete 1–5 scale with dynamic reactive badge descriptors:
     - `1`: 😞 *Not good* (Rose)
     - `2`: 😕 *Could be better* (Orange)
     - `3`: 🙂 *Pretty good* (Amber)
     - `4`: 😊 *Really good* (Lime)
     - `5`: ✨ *Loved it!* (Emerald)
   - Supports touch dragging, pointer slide, direct tick tapping, and accessible keyboard arrow inputs.
   - Web Vibration API triggers light haptic clicks (`12ms`) on score adjustments.
2. **Highlights & Notes (Step 6)**:
   - **Standout Chips**: Single-select highlight pill (*Coffee, Food, Dessert, Atmosphere, Staff, Value, Seating, Nothing specific*).
   - **Comment Field**: Freeform textarea with real-time character counter (capped at 300 characters).
3. **View Mode Flexibility**:
   - Customers can switch at any time between **Guided View** (one question per card with animated progress) and **All Questions View** (all 5 sliders + highlights on one scrollable page).
4. **AI Generation Stage (`ReviewGenerating`)**:
   - Smooth transition into a branded loading state featuring an animated ambient glowing icon.
   - Dynamic rotating status messages cycling every 1.8 seconds:
     - *"Putting your experience into words..."*
     - *"Catching your authentic vibe..."*
     - *"Drafting your personalized review..."*
5. **Review Delivery & Conversion (`ReviewResult`)**:
   - Displays the draft in an editable textarea.
   - **Edit Answers**: Reverts back to Step 1 without losing previous selections.
   - **Copy Review**: Copies text to clipboard with button state feedback (*Copied to clipboard!*) and haptics.
   - **Continue to Google Reviews**: Prominent primary button linking directly to the venue's Google Maps review dialog (`GOOGLE_REVIEW_URL`).

---

## 6. Prompt Engineering & AI Generation Logic

The prompt is constructed dynamically in `lib/gemini.ts` (Next.js) and `app/services/gemini_service.py` (Flask).

### Prompt Guidelines & Injected Constraints:
- **Voice & Persona**: First-person ("I", "my"), authentic, contemporary conversational cadence.
- **Style Variation**: To avoid repetitive openings (e.g. starting every review with *"Honestly..."* or *"Lowkey..."*), the system selects a random style guide variant per request:
  1. *Casual & natural conversational tone. Clean and simple with zero to one slang expression.*
  2. *Light Gen Z / contemporary casual voice. Use 1-2 natural terms like 'vibes', 'pretty solid', 'actually', or 'super'.*
  3. *Internet-native casual voice. Spontaneous and authentic using 2-3 phrases like 'fire', 'lowkey', 'worth it', or 'immaculate' where fitting.*
  4. *Relaxed conversational tone. Focus on effortless phrasing, varied rhythm, and casual sincerity.*
- **Rules Enforced**:
  - **Factual Grounding**: Strictly limited to provided scores, selected highlight, and customer comment.
  - **Length**: Strict constraint of **35 to 80 words**.
  - **Formatting**: Plain review text only — no enclosing quotes, no introductory filler ("Here is a review:"), no hashtags, no emojis unless the customer typed emojis in their comment.
- **Resilience & Retry**:
  - Automatically executes up to 2 generation attempts with an 800ms backoff on failure.
  - Automatically strips enclosing quotation marks if returned by the model.
  - Redacts sensitive API key values from error logs.

---

## 7. Design System & User Interface Principles

- **Mobile Ergonomics**:
  - Mobile-first design optimized for screens from 320px to 430px+ (iPhone SE to Pro Max).
  - Safe-area insets (`pb-safe`) and modern dynamic viewport units (`100dvh`) to prevent mobile browser address bar clipping.
  - Minimum tap target sizes >= 44x44px.
  - `user-select: none` on interactive tracks with zero horizontal layout shift.
- **Color Palette & Themes**:
  - **Light Mode**: Warm, inviting cafe aesthetic (cream/off-white background `#FAF9F5`, warm paper card `#FFFFFF`, dark charcoal foreground `#171717`).
  - **Dark Mode**: Deep obsidian slate (`#0B0B0D` background, `#141417` card surface, high-contrast crisp text `#F5F5F7`).
  - **System Persistence**: Synced with `localStorage['reviewflow-theme']` and inline script in `<head>` to prevent hydration theme flashing.
- **Typography**:
  - **Font**: Google Font **Plus Jakarta Sans** with weights 400, 500, 600, 700, and 800.
  - Monospaced numerals for counters and ratings.

---

## 8. Configuration & Environment Variables

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `GEMINI_API_KEY` | **Yes** | — | Google AI Studio API key (kept strictly server-side). |
| `GEMINI_MODEL` | No | `gemini-3.5-flash` | Gemini model variant to invoke. |
| `GOOGLE_REVIEW_URL` | Recommended | `""` | Direct link to Google Maps "Write a Review" dialog for the business. |
| `USE_FLASK_BACKEND` | No | `false` | When `true`, Next.js proxies review generation to Flask. |
| `FLASK_API_URL` | No | `""` | Base URL of the Flask service if proxying is enabled. |
| `SECRET_KEY` | Flask Only | `dev-secret-...` | Flask session and CSRF secret key. |
| `FLASK_CONFIG` | Flask Only | `development` | Environment profile: `development`, `testing`, `production`. |
| `PORT` | No | `3000` / `5000` | Port for web server. |

---

## 9. Developer & Operational Workflows

### 1. Running the Next.js Application (Default)
```bash
cd reviewflow_mvp
npm install
npm run dev
```
- Available at: `http://localhost:3000`
- Production build: `npm run build && npm start`

### 2. Running the Python Flask Application
```bash
cd reviewflow_mvp
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```
- Available at: `http://127.0.0.1:5000`

### 3. Running Test Suites
Python unit tests cover all validation logic, route behaviors, and service resilience:
```bash
cd reviewflow_mvp
python -m unittest discover -s tests -p "test_*.py" -v
```

### 4. Cloud Deployment (Render)
The repository includes a production-ready `render.yaml` specification for Render Web Services:
- **Build Command**: `npm install --include=dev && npm run build`
- **Start Command**: `npm start`
- **Node Version**: `20.19.5`
- Environment variables configured securely via the Render Dashboard.
