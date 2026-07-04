// ============================================================
// Market Brief — plain-English headlines that nudge the AUD→VND rate.
// Each item translates a real-world event into "what it means for your
// transfer" with a simple impact chip. No data-source / model talk.
//
// TODO(api): this sample array stands in for a future /v1/news feed.
// ============================================================

/**
 * ▲ A$ firming · ▼ A$ easing · ● worth watching
 * Chips describe the CURRENCY, not the reader: "helps your A$" assumed the
 * reader holds dollars, which is backwards for a parent buying them. The
 * meaning sentence interprets each headline for the primary audience
 * (parents paying A$ costs), with the homeward reading where it fits.
 */
export type Impact = "helps" | "weighs" | "watch";

export interface BriefItem {
  date: string; // short display date, e.g. "10 Jun"
  headline: string;
  /** Plain-English "what it means for your transfer". */
  meaning: string;
  source: string;
  impact: Impact;
}

export const IMPACT_PRESENTATION: Record<
  Impact,
  { glyph: string; label: string }
> = {
  helps: { glyph: "▲", label: "A$ firming" },
  weighs: { glyph: "▼", label: "A$ easing" },
  watch: { glyph: "●", label: "Worth watching" },
};

export const BRIEF_DATE = "Weekly · 10 June 2026";

export const SAMPLE_BRIEF: BriefItem[] = [
  {
    date: "10 Jun",
    headline: "Reserve Bank leaves interest rates on hold",
    meaning:
      "Steady Australian rates keep the dollar firm — if fees are due soon, don't count on them getting cheaper by waiting.",
    source: "Reserve Bank of Australia",
    impact: "helps",
  },
  {
    date: "9 Jun",
    headline: "Iron ore prices climb on stronger China demand",
    meaning:
      "Australia's biggest export firming up tends to lift the dollar over the following days — tuition and rent cost a little more đồng.",
    source: "Commodities desk",
    impact: "helps",
  },
  {
    date: "6 Jun",
    headline: "State Bank of Vietnam holds its reference rate steady",
    meaning:
      "A stable đồng means fewer surprises — what a payment costs today is likely close to what it costs next week.",
    source: "State Bank of Vietnam",
    impact: "watch",
  },
  {
    date: "5 Jun",
    headline: "US dollar softens after cooler inflation figures",
    meaning:
      "Moves in the US dollar ripple into the AUD–VND rate — a headline worth checking before a big payment.",
    source: "Global markets",
    impact: "watch",
  },
  {
    date: "3 Jun",
    headline: "Markets turn cautious as global growth worries return",
    meaning:
      "Nervous markets can soften the Australian dollar — often a friendlier moment to pay fees (and a reason for senders not to wait).",
    source: "Global markets",
    impact: "weighs",
  },
];
