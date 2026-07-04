"use client";

import { useMemo, useState } from "react";
import {
  adviceFor,
  pivotHorizon,
  type Direction,
  type ForecastResponse,
  type HistoryPoint,
} from "../lib/forecast";
import { formatAud, formatVnd, parseAmount } from "../lib/format";
import { ForecastBand } from "./ForecastBand";

// Tone → token colours for the verdict pill. Derived, never hardcoded label.
const PILL_TONE: Record<string, { bg: string; fg: string }> = {
  send: { bg: "rgba(28,138,104,.12)", fg: "var(--color-jade-deep)" },
  wait: { bg: "rgba(188,83,64,.12)", fg: "var(--color-clay)" },
  neutral: { bg: "rgba(216,154,42,.16)", fg: "var(--color-gold-deep)" },
};

// Parents paying tuition are the primary audience, so VND→AUD is the
// default tab. A semester invoice is denominated in A$ either way, so the
// input is always Australian dollars.
const MODES: Record<
  Direction,
  { tab: string; cardTitle: string; inputLabel: string; defaultAmount: string }
> = {
  vnd_to_aud: {
    tab: "Paying fees in Australia",
    cardTitle: "Your child's costs, in đồng",
    inputLabel: "Amount due",
    defaultAmount: "15,000",
  },
  aud_to_vnd: {
    tab: "Sending home to Việt Nam",
    cardTitle: "AUD → VND today",
    inputLabel: "If you send",
    defaultAmount: "1,000",
  },
};

function VerdictIcon({ tone }: { tone: string }) {
  if (tone === "send") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M3 8.5 6.5 12 13 4"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (tone === "wait") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" />
        <path
          d="M8 5v3l2 1.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M3 8h10"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function VerdictCard({
  forecast,
  history,
}: {
  forecast: ForecastResponse;
  history: HistoryPoint[];
}) {
  const [direction, setDirection] = useState<Direction>("vnd_to_aud");
  const [raw, setRaw] = useState(MODES.vnd_to_aud.defaultAmount);

  const mode = MODES[direction];
  const pivot = pivotHorizon(forecast);
  // Advice flips with direction: a rising rate is good news for a sender,
  // bad news for a parent buying A$. Same payload, same thresholds.
  const advice = adviceFor(pivot.prob_higher, direction);
  const pill = PILL_TONE[advice.tone];

  const amount = useMemo(() => parseAmount(raw), [raw]);
  const vndToday = amount * forecast.spot;
  const vndWait = amount * pivot.mid; // most likely level in ~5 days
  // Positive = waiting looks cheaper (rate falling). Who that helps
  // depends on direction; the copy below interprets it.
  const waitIsLower = vndToday - vndWait >= 0;
  const diffAbs = Math.abs(vndToday - vndWait);

  function switchDirection(d: Direction) {
    if (d === direction) return;
    setDirection(d);
    setRaw(MODES[d].defaultAmount);
  }

  function handleBlur() {
    if (amount > 0) setRaw(formatAud(amount));
  }

  return (
    <div className="card relative p-5 sm:p-6">
      {/* Direction toggle — parents first, senders one tap away. */}
      <div
        role="group"
        aria-label="Which way is your money going?"
        className="mb-4 grid grid-cols-2 gap-1 rounded-full border border-line bg-paper p-1"
      >
        {(Object.keys(MODES) as Direction[]).map((d) => (
          <button
            key={d}
            type="button"
            aria-pressed={direction === d}
            onClick={() => switchDirection(d)}
            className={`rounded-full px-2 py-2 text-[13px] font-semibold transition-colors ${
              direction === d
                ? "bg-jade text-white shadow-sm"
                : "text-muted hover:text-ink"
            }`}
          >
            {MODES[d].tab}
          </button>
        ))}
      </div>

      <div className="mb-[18px] flex items-center justify-between">
        <span className="flex items-center gap-2 font-display text-[17px] font-bold">
          <span
            className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] text-white"
            style={{ background: "var(--color-jade)" }}
            aria-hidden="true"
          >
            $
          </span>
          {mode.cardTitle}
        </span>
        <span className="rounded-md border border-line-strong px-[7px] py-[3px] text-[11px] uppercase tracking-[.1em] text-muted">
          Example
        </span>
      </div>

      <div className="mb-1.5 flex items-center gap-2.5 rounded-[14px] border border-line bg-paper px-3.5 py-3">
        <label
          htmlFor="aud-amount"
          className="whitespace-nowrap text-[13px] text-muted"
        >
          {mode.inputLabel}
        </label>
        <span className="font-bold text-jade" aria-hidden="true">
          A$
        </span>
        <input
          id="aud-amount"
          type="text"
          inputMode="decimal"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          onBlur={handleBlur}
          aria-label="Amount in Australian dollars"
          className="w-full border-none bg-transparent font-display text-2xl font-bold tracking-[-.01em] text-ink outline-none"
        />
      </div>

      <div className="mx-0.5 mb-1 mt-3.5 flex items-baseline gap-2">
        <span className="font-display text-[clamp(27px,7.5vw,34px)] font-bold tracking-[-.02em] text-ink">
          ₫{formatVnd(vndToday)}
        </span>
        <span className="text-[14px] text-muted">
          {direction === "vnd_to_aud"
            ? "what it costs today"
            : "at today's rate"}
        </span>
      </div>

      <div
        className="my-3.5 inline-flex items-center gap-2.5 rounded-full px-4 py-2.5 text-[15px] font-bold"
        style={{ background: pill.bg, color: pill.fg }}
        role="status"
      >
        <VerdictIcon tone={advice.tone} />
        {advice.label}
      </div>

      <p className="mb-4 text-[14.5px] text-muted">
        <b className="font-semibold text-ink">{advice.reason}</b>
      </p>

      <div className="border-t border-dashed border-line-strong pt-3.5">
        <ForecastBand history={history} forecast={forecast} />
        <p className="mt-2.5 text-[13px] text-muted">
          {direction === "vnd_to_aud" ? (
            <>
              If you wait ~5 days, the most likely rate makes this{" "}
              <b className="font-bold text-ink">≈ ₫{formatVnd(vndWait)}</b> —
              about{" "}
              <b
                className={`font-bold ${waitIsLower ? "text-jade-deep" : "text-clay"}`}
              >
                ₫{formatVnd(diffAbs)} {waitIsLower ? "cheaper" : "dearer"}
              </b>{" "}
              than paying today. It could land anywhere in the shaded range.
            </>
          ) : (
            <>
              If you wait ~5 days, the most likely rate puts this transfer at{" "}
              <b className="font-bold text-ink">≈ ₫{formatVnd(vndWait)}</b> —
              about{" "}
              <b
                className={`font-bold ${waitIsLower ? "text-clay" : "text-jade-deep"}`}
              >
                ₫{formatVnd(diffAbs)} {waitIsLower ? "less" : "more"}
              </b>{" "}
              than today. It could land anywhere in the shaded range.
            </>
          )}
        </p>
      </div>

      <p className="mt-3.5 text-[11.5px] text-muted opacity-80">
        Forecasts are estimates, not guarantees. Sen never holds your money —
        you pay through your own bank or your university&apos;s portal.
      </p>
    </div>
  );
}
