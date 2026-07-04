// GET /api/forecast — returns today's forecast as JSON.
//
// Thin wrapper over the forecast source seam so a client-side or external
// caller has an endpoint too. Returns the placeholder sample payload until
// NEXT_PUBLIC_API_URL is set, then mirrors the live service. Same shape as the
// real /v1/forecast.

import { NextResponse } from "next/server";
import { getForecast } from "../../lib/forecast-source";

export async function GET() {
  const forecast = await getForecast();
  return NextResponse.json(forecast);
}
