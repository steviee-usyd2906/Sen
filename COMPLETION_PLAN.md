# Sen website — completion plan (future sessions)

**Goal:** turn the current static marketing site into a *complete, production-ready
web app* — sign-in, authentication, a database, a logged-in dashboard, target-rate
alerts, email, and Plus billing — while the **forecast model stays a placeholder**.
The model is the *only* thing that may remain stubbed; everything else on the
website must be finished.

**Status when this plan was written (2026-06-12):**
- ✅ Static marketing site builds clean (`next build` passes; `/` prerenders static).
- ✅ Sections done: nav, hero + interactive verdict card/converter, trust strip, why-timing, how-it-works, features, Market Brief, testimonial, pricing, FAQ, CTA, footer.
- ✅ Verdict logic mirrors the real API contract (`app/lib/forecast.ts` → `verdictFrom`, thresholds identical to `audvnd_output/serving/app.py`).
- ❌ No auth, no sign-in, no database, no dashboard, no billing, no email, no protected routes, no legal pages. Footer/nav links are `#` placeholders.

---

## 0. Locked stack & non-negotiables (do not relitigate)

- **Framework:** Next.js 15 App Router, React 19, TypeScript, Tailwind v4 (already in `package.json`).
- **Auth + DB (app data):** **Supabase** — Postgres + Auth. Use `@supabase/ssr` for cookie-based sessions in the App Router.
- **Billing:** **Stripe** — Plus subscription (~$6/mo), Checkout + Customer Portal + webhooks.
- **Email:** **Resend** — magic-link auth emails, good-time alerts, weekly summary.
- **Deploy:** **Vercel.**
- **Forecast store:** the **TimescaleDB** schema in `audvnd_output/serving/schema.sql` (`rates_daily`, `forecasts`, `alerts`) is the *model* side. The website does **not** own forecasts; it reads them through the forecast API (placeholder for now — see §1).
- **Honesty constraints (keep in ALL copy + product):**
  - **Sen does NOT move money.** Forecasts + alerts only; users transfer with their own bank/service.
  - **Zero ML jargon** on every customer surface (no model/LSTM/quantile talk) — levels, a verdict, a plain reason.
- **Env vars** already enumerated in `.env.example` (Supabase, Stripe, Resend, `NEXT_PUBLIC_API_URL`). Fill these in `.env.local`.

**Dependencies to add (future):**
`@supabase/supabase-js`, `@supabase/ssr`, `stripe`, `resend`, `zod` (input validation).
Dev: `eslint`, `eslint-config-next`, `prettier` (no lint config exists yet).

---

## 1. The model placeholder — the ONE thing left stubbed

Keep a single, well-marked seam so the rest of the app integrates against a real
fetch boundary and the model can drop in later with zero UI changes.

- **Today:** `app/lib/forecast.ts` exports `SAMPLE_FORECAST` / `SAMPLE_HISTORY`, shaped exactly like `/v1/forecast` and `/v1/history`.
- **Do:** add a Next.js route handler `app/api/forecast/route.ts` (and `app/api/history/route.ts`) that returns the sample payloads **when `NEXT_PUBLIC_API_URL` is unset**, and proxies the real FastAPI service when it is set. Centralise this in `app/lib/forecast-source.ts`:
  ```ts
  export async function getForecast(): Promise<ForecastResponse> {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) return SAMPLE_FORECAST;            // PLACEHOLDER MODEL
    const res = await fetch(`${base}/v1/forecast`, { next: { revalidate: 3600 } });
    return res.json();
  }
  ```
- **Acceptance:** every component/page reads forecasts via `getForecast()` / `getHistory()`, never `SAMPLE_*` directly. Flipping `NEXT_PUBLIC_API_URL` swaps stub → real with no other change. Leave a banner/dev note that figures are illustrative until the model is wired.
- **Out of scope:** standing up Kafka/TimescaleDB/the real forecast service. That's the ML track, not the website.

---

## 2. Phased build

Each phase lists the outcome, files to create, and acceptance criteria. Suggested
order is top-to-bottom; phases 2→4 are the spine, 5→7 are the paid surface.

### Phase A — Project hygiene
- **Outcome:** lint/format/CI in place before feature work.
- **Files:** `eslint.config.mjs` (next + typescript), `.prettierrc`, `.github/workflows/ci.yml` (typecheck + `next build`).
- **Acceptance:** `npm run lint` and `npm run build` pass in CI.

### Phase B — Supabase auth + sign-in
- **Outcome:** real magic-link sign-in/up/out; session available in server components.
- **Files:**
  - `app/lib/supabase/server.ts`, `app/lib/supabase/client.ts`, `app/lib/supabase/middleware.ts` (using `@supabase/ssr`).
  - `middleware.ts` (refresh session cookies, protect `/dashboard/**`).
  - `app/(auth)/sign-in/page.tsx`, `app/(auth)/sign-up/page.tsx`, `components/auth/LoginForm.tsx` (email → magic link).
  - `app/auth/callback/route.ts` (code exchange), `app/api/auth/sign-out/route.ts`.
  - Wire nav "Sign in" / "Get started free" to these; show signed-in state in nav.
- **Acceptance:** a new email can sign up, receive a magic link (Resend, see Phase F), land authenticated, see `/dashboard`, and sign out. `/dashboard` redirects to `/sign-in` when logged out.

### Phase C — Application database (Supabase Postgres)
- **Outcome:** app-owned tables with Row-Level Security. (Forecasts stay in the ML-side TimescaleDB; these are *user* tables.)
- **Tables (SQL migration in `supabase/migrations/`):**
  - `profiles` (id → auth.users, display_name, default_amount_aud, direction `aud_to_vnd|vnd_to_aud`, created_at).
  - `plans` or a `profiles.plan` enum (`free|plus|business`) + Stripe customer/subscription ids.
  - `alerts` (mirror `audvnd_output/serving/schema.sql`: user_id, target_rate, horizon_days, created_at, triggered_at) — but in Supabase so RLS + the UI own it; the ML worker can read it.
  - `transfers_log` (optional: amount, rate_used, sent_on) for the savings tracker.
- **Acceptance:** RLS lets a user read/write only their own rows; migrations apply cleanly; a typed data layer (`app/lib/db/*.ts`) wraps queries.

### Phase D — Logged-in dashboard (non-technical, mirrors the marketing card)
- **Outcome:** the real product surface, same warm jade/gold language, zero jargon.
- **Files/routes:**
  - `app/dashboard/layout.tsx` (auth-gated shell, account menu).
  - `app/dashboard/page.tsx` — today's verdict card for the user's saved amount/direction (reads `getForecast()`), the "if you wait" comparison, the multi-horizon read in plain words (1 day / 1 week / 2 weeks / 1 month).
  - `app/dashboard/history/page.tsx` — past rates + a **savings tracker** ("extra ₫ vs sending on a random day"), driven by `getHistory()` + `transfers_log`.
  - `app/dashboard/account/page.tsx` — profile defaults, plan status, manage billing.
- **Acceptance:** every number flows from `getForecast()/getHistory()` and the user's profile; no `SAMPLE_*` imports; passes the honesty + no-jargon bar.

### Phase E — Target-rate alerts (Plus feature)
- **Outcome:** users set "tell me when A$1,000 buys ≥ ₫X" and get notified.
- **Files:**
  - `components/alerts/AlertForm.tsx`, `app/dashboard/alerts/page.tsx` (CRUD over the `alerts` table; Plus-gated).
  - `app/api/alerts/route.ts` (+ `[id]`) with `zod` validation and RLS-backed writes.
  - **Evaluation worker:** `app/api/cron/evaluate-alerts/route.ts` invoked by a **Vercel Cron** (daily after the forecast updates). For each open alert, compute `P(rate ≥ target within horizon)` from the forecast distribution; if it crosses, mark `triggered_at` and send the email (Phase F).
- **Acceptance:** creating an alert persists it; the cron marks + emails a crossing alert exactly once; free users are gated with an upgrade prompt.

### Phase F — Email (Resend)
- **Outcome:** transactional + lifecycle email.
- **Files:** `app/lib/email/resend.ts`, `app/lib/email/templates/*` (magic link, good-time alert, weekly summary). Wire Supabase auth emails through Resend (custom SMTP or hook).
- **Acceptance:** magic-link, alert-triggered, and a weekly-summary cron email all send and render; `RESEND_FROM_EMAIL` verified domain.

### Phase G — Stripe Plus subscription
- **Outcome:** Free → Plus upgrade, gating, self-serve management.
- **Files:**
  - `app/lib/stripe.ts`, `app/api/checkout/route.ts` (Checkout Session for `STRIPE_PRICE_ID_PLUS`), `app/api/stripe/portal/route.ts` (Customer Portal), `app/api/webhooks/stripe/route.ts` (subscription created/updated/deleted → set `profiles.plan`).
  - Pricing CTAs call checkout; dashboard shows plan + "Manage billing".
  - Plan gate helper `app/lib/plan.ts` (`requirePlus()`).
- **Acceptance:** test-mode checkout upgrades a user to Plus (webhook-driven), unlocks alerts + 30-day forecasts; cancelling downgrades; portal works.

### Phase H — Site completeness (no dead links)
- **Outcome:** every nav/footer link resolves; legal in place.
- **Files:** `app/privacy/page.tsx`, `app/terms/page.tsx`, `app/about/page.tsx`, `app/contact/page.tsx`. Update `SiteNav`/`SiteFooter` hrefs. Add `app/sitemap.ts`, `app/robots.ts`, OG/Twitter metadata, real `manifest`.
- **Acceptance:** no `href="#"` placeholders remain except intentional in-page anchors; "not financial advice / does not move money" disclaimers present on legal + footer.

### Phase I — Deploy & ops
- **Outcome:** live on Vercel with secrets and observability.
- **Tasks:** Vercel project + env vars (all of `.env.example`), Supabase project (prod), Stripe live keys + webhook endpoint, Resend domain, Vercel Cron schedules, basic error logging. Remove any dev-only secrets.
- **Acceptance:** prod build deploys; auth/billing/alerts/email work against live services; `NEXT_PUBLIC_API_URL` still optional (placeholder model until the forecast service ships).

---

## 3. Cross-cutting requirements (apply in every phase)
- **Honesty/no-jargon:** re-check copy each phase; the dashboard and emails are the highest-risk surfaces for leaking model talk or implying money movement.
- **Accessibility:** semantic landmarks, labelled inputs, focus states (already established in `globals.css`), reduced-motion respected.
- **Security:** Supabase RLS on every user table; validate all route-handler input with `zod`; never expose service-role key to the client; Stripe webhook signature verification.
- **Type safety:** generate Supabase types (`supabase gen types typescript`) into `app/lib/db/types.ts`.
- **Tests (lightweight):** unit-test `verdictFrom`, alert-crossing logic, and plan gating; a smoke e2e for sign-in → dashboard.

---

## 4. Suggested milestones
1. **M1 — "Real accounts":** Phases A–C. Users sign in and have a profile/db. (Marketing site already done.)
2. **M2 — "Real product":** Phase D. Authenticated dashboard reading the placeholder forecast.
3. **M3 — "Retention":** Phases E–F. Alerts + email — the core remittance-sender value loop.
4. **M4 — "Revenue":** Phase G. Plus billing + gating.
5. **M5 — "Ship":** Phases H–I. Polish, legal, deploy.

The forecast model can be swapped from placeholder to live at **any** point after M2 by setting `NEXT_PUBLIC_API_URL` — it is intentionally decoupled from all of the above.

---

## 5. Open decisions to confirm next session
- Supabase auth emails via Resend SMTP vs. Supabase default sender (affects Phase B/F sequencing).
- Free vs Plus feature split for alerts (how many free alerts, if any) and forecast horizon gating (Free sees 1-day only? Plus sees 1/5/10/22?).
- Where the alert-evaluation cron reads forecasts from while the model is a placeholder (sample data vs. a seeded `forecasts` row) — keep it reading `getForecast()` so it works either way.
- Whether `transfers_log` (manual "I sent on this day") ships in M2 or M3 for the savings tracker.
