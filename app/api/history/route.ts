// GET /api/history?days=90 — returns recent closing rates as JSON.
//
// Thin wrapper over the forecast source seam so a client-side or external
// caller has an endpoint too. Returns the placeholder sample payload until
// NEXT_PUBLIC_API_URL is set, then mirrors the live service. Same shape as the
// real /v1/history.

import { NextResponse } from "next/server";
import { getHistory } from "../../lib/forecast-source";

const DEFAULT_DAYS = 90;
const MAX_DAYS = 365;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("days");

  // Validate ?days= is a sane positive integer; otherwise fall back to default.
  let days = DEFAULT_DAYS;
  if (raw !== null) {
    const parsed = Number(raw);
    if (Number.isInteger(parsed) && parsed > 0 && parsed <= MAX_DAYS) {
      days = parsed;
    }
  }

  const history = await getHistory(days);
  return NextResponse.json(history);
}
