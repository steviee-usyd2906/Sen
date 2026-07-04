// ============================================================
// Forecast source seam — the ONE place the site reads forecast data.
//
// When NEXT_PUBLIC_API_URL is unset/empty, this returns the typed sample
// payloads from app/lib/forecast.ts (the PLACEHOLDER MODEL). When it is set,
// it fetches the real FastAPI service (audvnd_output/serving/app.py):
//   GET /v1/forecast        -> ForecastResponse
//   GET /v1/history?days=90 -> HistoryPoint[]
//
// Flipping NEXT_PUBLIC_API_URL swaps stub → real with no other change in the
// app. Every component/page reads forecasts through getForecast()/getHistory()
// here — never the SAMPLE_* constants directly. Fetch failures fall back to the
// sample data so a flaky API can never crash a page.
// ============================================================

import {
  SAMPLE_FORECAST,
  SAMPLE_HISTORY,
  type ForecastResponse,
  type HistoryPoint,
} from "./forecast";

/** Default history window, matching the live /v1/history default. */
const DEFAULT_HISTORY_DAYS = 90;

function apiUrl(path: string): string | null {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
  return base ? `${base}${path}` : null;
}

/** Today's verdict + horizons. Falls back to sample data on any failure. */
export async function getForecast(): Promise<ForecastResponse> {
  const url = apiUrl("/v1/forecast");
  if (!url) return SAMPLE_FORECAST; // PLACEHOLDER MODEL
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return SAMPLE_FORECAST;
    return (await res.json()) as ForecastResponse;
  } catch {
    return SAMPLE_FORECAST;
  }
}

/** Recent closing rates. Falls back to sample data on any failure. */
export async function getHistory(
  days: number = DEFAULT_HISTORY_DAYS,
): Promise<HistoryPoint[]> {
  const url = apiUrl(`/v1/history?days=${encodeURIComponent(days)}`);
  if (!url) return SAMPLE_HISTORY; // PLACEHOLDER MODEL
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return SAMPLE_HISTORY;
    return (await res.json()) as HistoryPoint[];
  } catch {
    return SAMPLE_HISTORY;
  }
}
