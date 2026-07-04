// ============================================================
// Forecast data contract + verdict logic for Sen's customer site.
//
// These types mirror the real forecast API exactly:
//   GET /v1/forecast  -> ForecastResponse
//   GET /v1/history?days=90 -> HistoryPoint[]
// (see audvnd_output/serving/app.py). The customer surface carries
// ZERO finance/ML jargon: levels, a verdict, a plain reason — nothing else.
//
// TODO(api): swap the SAMPLE_* constants below for live fetches, e.g.
//   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/forecast`,
//                           { next: { revalidate: 3600 } });
//   const forecast: ForecastResponse = await res.json();
// The verdict/label/reason helpers here will keep working unchanged because
// they derive everything from the payload, proving the contract end to end.
// ============================================================

/** One horizon row. low/mid/high are p10/p50/p90 VND-per-AUD levels. */
export interface HorizonForecast {
  horizon_days: number;
  low: number;
  mid: number;
  high: number;
  /** P(rate is higher at t+h). Higher VND-per-AUD is better for an AUD→VND sender. */
  prob_higher: number;
}

export type Verdict =
  | "good_day_to_send"
  | "consider_waiting"
  | "no_strong_signal";

export interface ForecastResponse {
  /** ISO date the forecast was made for (matches API `as_of`). */
  as_of: string;
  /** Today's spot rate, VND per AUD. */
  spot: number;
  verdict: Verdict;
  reason: string;
  horizons: HorizonForecast[];
}

/** One day of closing rate, shaped like GET /v1/history. */
export interface HistoryPoint {
  date: string;
  close: number;
}

// ---- Verdict thresholds — identical to the API (serving/app.py) ----
// The 5-day horizon is the natural "send now or wait?" window.
export const VERDICT_PIVOT_HORIZON = 5;

/**
 * Derive verdict + a plain-English reason from a probability, using the
 * exact same thresholds as the forecast API. Nothing here is hardcoded on
 * the card — it all flows from the payload.
 */
export function verdictFrom(probHigher: number): {
  verdict: Verdict;
  reason: string;
} {
  if (probHigher < 0.4) {
    return {
      verdict: "good_day_to_send",
      reason: "The rate looks more likely to slip than to improve.",
    };
  }
  if (probHigher > 0.6) {
    return {
      verdict: "consider_waiting",
      reason: "The rate looks more likely to improve if you can wait.",
    };
  }
  return {
    verdict: "no_strong_signal",
    reason: "The rate looks steady either way — send when it suits you.",
  };
}

/** Customer-facing presentation for each verdict (label + token colour). */
export const VERDICT_PRESENTATION: Record<
  Verdict,
  { label: string; tone: "send" | "wait" | "neutral" }
> = {
  good_day_to_send: { label: "Good day to send", tone: "send" },
  consider_waiting: { label: "Consider waiting", tone: "wait" },
  no_strong_signal: { label: "No strong signal", tone: "neutral" },
};

// ---- Direction-aware advice ----------------------------------------
// The forecast is one rate (VND per AUD), but who it favours depends on
// which way the money goes. prob_higher = P(rate rises):
//   · AUD→VND sender (diaspora): a HIGHER rate is better — more đồng.
//   · VND→AUD payer (parents paying tuition/rent): a LOWER rate is
//     better — the A$ costs fewer đồng. The advice INVERTS.

/** Which way the money is going. Parents paying fees buy A$ with đồng. */
export type Direction = "vnd_to_aud" | "aud_to_vnd";

export interface Advice {
  label: string;
  tone: "send" | "wait" | "neutral";
  reason: string;
}

/**
 * Plain-English advice for a given direction, from the same pivot
 * probability and thresholds as the API. For VND→AUD the mapping flips:
 * a rate that's likely to RISE means the A$ is getting dearer — pay now.
 */
export function adviceFor(probHigher: number, direction: Direction): Advice {
  if (direction === "aud_to_vnd") {
    const { verdict, reason } = verdictFrom(probHigher);
    const { label, tone } = VERDICT_PRESENTATION[verdict];
    return { label, tone, reason };
  }
  // vnd_to_aud — buying Australian dollars with đồng.
  if (probHigher > 0.6) {
    return {
      label: "Good day to pay",
      tone: "send",
      reason: "The A$ looks more likely to get dearer — paying sooner looks sensible.",
    };
  }
  if (probHigher < 0.4) {
    return {
      label: "Waiting could save you",
      tone: "wait",
      reason: "The A$ looks more likely to get cheaper over the next few days.",
    };
  }
  return {
    label: "No rush either way",
    tone: "neutral",
    reason: "The rate looks steady — pay when it suits you.",
  };
}

/** Pick the horizon row that drives the verdict (5-day, or nearest fallback). */
export function pivotHorizon(forecast: ForecastResponse): HorizonForecast {
  return (
    forecast.horizons.find((h) => h.horizon_days === VERDICT_PIVOT_HORIZON) ??
    forecast.horizons[0]
  );
}

// ============================================================
// SAMPLE DATA — illustrative only. Shaped EXACTLY like the live payloads.
// TODO(api): delete once wired to the real /v1 endpoints.
// ============================================================

// prob_higher = 0.34 on the 5-day horizon → < 0.40 → "good_day_to_send".
// Because the verdict is derived, changing this value flips the card.
export const SAMPLE_FORECAST: ForecastResponse = {
  as_of: "2026-06-10",
  spot: 16340,
  verdict: "good_day_to_send",
  reason: "The rate looks more likely to slip than to improve.",
  horizons: [
    { horizon_days: 1, low: 16280, mid: 16330, high: 16390, prob_higher: 0.46 },
    { horizon_days: 5, low: 16080, mid: 16210, high: 16360, prob_higher: 0.34 },
    { horizon_days: 10, low: 15980, mid: 16170, high: 16380, prob_higher: 0.38 },
    // 22 trading days ≈ one calendar month — matches the model's horizon set.
    { horizon_days: 22, low: 15820, mid: 16140, high: 16500, prob_higher: 0.42 },
  ],
};

// 90 sample days of gentle drift, ending near today's spot. Illustrative.
export const SAMPLE_HISTORY: HistoryPoint[] = (() => {
  const days = 90;
  const end = SAMPLE_FORECAST.spot;
  const points: HistoryPoint[] = [];
  const start = new Date(SAMPLE_FORECAST.as_of);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(start);
    d.setDate(start.getDate() - i);
    // smooth wave + slight uptrend toward `end`, deterministic (no Math.random)
    const t = (days - 1 - i) / (days - 1);
    const wave = Math.sin(t * Math.PI * 2.4) * 120 + Math.sin(t * Math.PI * 6) * 45;
    const trend = (t - 1) * 260; // ends at +0
    points.push({
      date: d.toISOString().slice(0, 10),
      close: Math.round(end + trend + wave),
    });
  }
  return points;
})();
