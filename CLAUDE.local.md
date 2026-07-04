# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Sen ("gửi đúng lúc") — customer-facing marketing site for an AUD→VND transfer-timing companion. It tells users whether today looks like a good day to convert AUD to VND. Sen does **not** move money. Next.js 15 App Router, React 19, Tailwind CSS v4, TypeScript.

## Commands

```
npm run dev        # dev server at localhost:3000
npm run build      # production build
npm run lint       # eslint .
npm run typecheck  # tsc --noEmit
npm run format     # prettier --write .
```

There is no test framework configured.

## Architecture

### The forecast source seam (most important concept)

`app/lib/forecast-source.ts` is the ONE place the site reads forecast data. Everything flows through `getForecast()` / `getHistory()`:

- When `NEXT_PUBLIC_API_URL` is unset (the default), they return typed sample data (`SAMPLE_FORECAST` / `SAMPLE_HISTORY` in `app/lib/forecast.ts`).
- When set, they fetch the real FastAPI backend (`GET /v1/forecast`, `GET /v1/history?days=90`) with a 1-hour revalidate, falling back to sample data on any failure.

Never read the `SAMPLE_*` constants directly from components — always go through the seam. The sample payloads are shaped exactly like the live API, so flipping the env var swaps stub→real with no other change.

The site runs end-to-end with ALL env vars unset. Seams for future integrations (Supabase auth, Stripe checkout, Resend email) are marked with `TODO(api)` and `TODO(plug-in)` comments — search for those markers before wiring anything up; `.env.example` maps each var to its seam.

### Verdict logic

The verdict ("good day to send" / "consider waiting" / "no strong signal") is **derived from the payload**, never hardcoded: `verdictFrom(prob_higher)` in `app/lib/forecast.ts` applies the same thresholds as the backend (< 0.4 → send, > 0.6 → wait), pivoting on the 5-day horizon (`pivotHorizon`). Presentation (labels, tones) lives in `VERDICT_PRESENTATION`; components map tone → design-token colours.

### Structure

- `app/page.tsx` — the landing page, a stack of section components from `app/components/`.
- `app/api/forecast|history/route.ts` — thin JSON wrappers over the forecast seam for client-side/external callers.
- `app/about|contact|privacy|terms|sign-in/page.tsx` — secondary pages.
- Components are server components by default; `"use client"` only where interactive (e.g. `VerdictCard` converter, `Sparkline`).

### Design system

Tailwind v4 with all tokens in `app/globals.css` via `@theme` (colors: paper/ink/jade/gold/clay — deliberately NOT fintech blue) and shared `@utility` classes (`wrap`, `card`, `btn`, `eyebrow`, …). Fonts: Fraunces (display serif) + Plus Jakarta Sans, loaded via `next/font` in `app/layout.tsx` with the Vietnamese subset (needed for accents like "gửi đúng lúc"). Use the tokens, not raw hex values.

### Voice

Customer copy carries zero finance/ML jargon — levels, a verdict, a plain-English reason, nothing else. Keep new copy in that register (e.g. "more dong for your dollar", not "p50 forecast").
