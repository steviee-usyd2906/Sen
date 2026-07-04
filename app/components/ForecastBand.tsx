import type { ForecastResponse, HistoryPoint } from "../lib/forecast";

// ============================================================
// ForecastBand — the quantile forecast, drawn for someone with
// zero finance background:
//
//   · a solid line for where the rate has actually been
//   · a soft shaded fan for where it could plausibly go (p10–p90)
//   · a dashed line through the middle for the most likely path (p50)
//
// Deliberately NOT a trading chart: no candlesticks, no axes grid,
// no tick labels — just "past", "today", and "the month ahead".
// Everything is derived from the /v1-shaped payload.
// ============================================================

const W = 340;
const H = 168;
const PAD_TOP = 16;
const PAD_BOTTOM = 30; // room for the past / ahead footer labels
const PAD_X = 6;
/** Share of the width given to history; the rest is the forecast fan. */
const SPLIT = 0.56;

export function ForecastBand({
  history,
  forecast,
}: {
  history: HistoryPoint[];
  forecast: ForecastResponse;
}) {
  const closes = history.map((p) => p.close);
  const horizons = [...forecast.horizons].sort(
    (a, b) => a.horizon_days - b.horizon_days,
  );
  const maxDays = horizons[horizons.length - 1]?.horizon_days ?? 1;

  // Y domain spans everything we draw, with a little breathing room.
  const values = [
    ...closes,
    forecast.spot,
    ...horizons.flatMap((h) => [h.low, h.high]),
  ];
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const breathe = (rawMax - rawMin || 1) * 0.06;
  const min = rawMin - breathe;
  const max = rawMax + breathe;

  const plotH = H - PAD_TOP - PAD_BOTTOM;
  const y = (v: number) => PAD_TOP + plotH - ((v - min) / (max - min)) * plotH;

  const xSplit = PAD_X + (W - PAD_X * 2) * SPLIT;
  const xHist = (i: number) =>
    closes.length <= 1
      ? PAD_X
      : PAD_X + (i / (closes.length - 1)) * (xSplit - PAD_X);
  const xFore = (days: number) =>
    xSplit + (days / maxDays) * (W - PAD_X - xSplit);

  const histPts = closes
    .map((c, i) => `${xHist(i).toFixed(1)},${y(c).toFixed(1)}`)
    .join(" ");

  // The fan opens from today's actual rate, so band and history meet cleanly.
  const anchor = `${xSplit.toFixed(1)},${y(forecast.spot).toFixed(1)}`;
  const highPts = horizons.map(
    (h) => `${xFore(h.horizon_days).toFixed(1)},${y(h.high).toFixed(1)}`,
  );
  const lowPts = horizons.map(
    (h) => `${xFore(h.horizon_days).toFixed(1)},${y(h.low).toFixed(1)}`,
  );
  const bandPoints = [anchor, ...highPts, ...[...lowPts].reverse(), anchor].join(
    " ",
  );
  const midPts = [
    anchor,
    ...horizons.map(
      (h) => `${xFore(h.horizon_days).toFixed(1)},${y(h.mid).toFixed(1)}`,
    ),
  ].join(" ");

  const last = horizons[horizons.length - 1];
  const todayY = y(forecast.spot);

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`The AUD to VND rate over the past ${history.length} days, and the range we expect over the next ${maxDays} trading days — about a month. Most likely path ends near ${Math.round(last?.mid ?? forecast.spot)} dong per dollar.`}
      >
        {/* where the rate has been */}
        <polyline
          points={histPts}
          fill="none"
          stroke="var(--color-jade)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* the range we'd expect (p10–p90 fan) */}
        <polygon points={bandPoints} fill="rgba(28,138,104,.14)" />
        <polyline
          points={highPts.join(" ")}
          fill="none"
          stroke="rgba(28,138,104,.35)"
          strokeWidth="1"
        />
        <polyline
          points={lowPts.join(" ")}
          fill="none"
          stroke="rgba(28,138,104,.35)"
          strokeWidth="1"
        />

        {/* most likely path (p50) */}
        <polyline
          points={midPts}
          fill="none"
          stroke="var(--color-jade-deep)"
          strokeWidth="2.2"
          strokeDasharray="4 5"
          strokeLinecap="round"
        />

        {/* today: the seam between fact and forecast */}
        <line
          x1={xSplit}
          y1={PAD_TOP - 2}
          x2={xSplit}
          y2={H - PAD_BOTTOM + 4}
          stroke="var(--color-line-strong)"
          strokeWidth="1"
          strokeDasharray="2 3"
        />
        <circle cx={xSplit} cy={todayY} r="3.5" fill="var(--color-gold)" />
        <circle
          cx={xSplit}
          cy={todayY}
          r="6.5"
          fill="none"
          stroke="var(--color-gold)"
          strokeOpacity=".35"
        />
        <text
          x={xSplit}
          y={PAD_TOP - 5}
          textAnchor="middle"
          fontSize="9.5"
          fontWeight="700"
          fill="var(--color-gold-deep)"
          style={{ letterSpacing: ".08em", textTransform: "uppercase" }}
        >
          Today
        </text>

        {/* plain-English footer, instead of axis ticks */}
        <text
          x={PAD_X + 2}
          y={H - 8}
          fontSize="10"
          fill="var(--color-muted)"
        >
          Past 3 months
        </text>
        <text
          x={W - PAD_X - 2}
          y={H - 8}
          textAnchor="end"
          fontSize="10"
          fill="var(--color-muted)"
        >
          The month ahead
        </text>
      </svg>

      {/* legend in words, not symbols to decode */}
      <figcaption className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-[3px] w-4 rounded-full"
            style={{
              background:
                "repeating-linear-gradient(90deg, var(--color-jade-deep) 0 4px, transparent 4px 8px)",
            }}
            aria-hidden="true"
          />
          Most likely path
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-4 rounded-[3px]"
            style={{ background: "rgba(28,138,104,.18)" }}
            aria-hidden="true"
          />
          Where it could land
        </span>
      </figcaption>
    </figure>
  );
}
