/** Small formatting helpers shared across the converter + cards. */

/** Whole-number grouping, e.g. 16340000 -> "16,340,000". */
export function formatVnd(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

/** Group an A$ amount for display, preserving an in-progress decimal. */
export function formatAud(value: number): string {
  return value.toLocaleString("en-US");
}

/** Strip anything that isn't a digit or dot, then parse. NaN -> 0. */
export function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}
