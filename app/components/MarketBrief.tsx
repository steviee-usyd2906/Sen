import {
  BRIEF_DATE,
  IMPACT_PRESENTATION,
  SAMPLE_BRIEF,
  type Impact,
} from "../lib/marketBrief";
import { SectionHead } from "./SectionHead";

// Impact chip → token colours (jade helps · clay weighs · gold watch).
const CHIP_TONE: Record<Impact, { bg: string; fg: string }> = {
  helps: { bg: "rgba(28,138,104,.13)", fg: "var(--color-jade-deep)" },
  weighs: { bg: "rgba(188,83,64,.13)", fg: "var(--color-clay)" },
  watch: { bg: "rgba(216,154,42,.16)", fg: "var(--color-gold-deep)" },
};

function ImpactChip({ impact }: { impact: Impact }) {
  const { glyph, label } = IMPACT_PRESENTATION[impact];
  const tone = CHIP_TONE[impact];
  return (
    <span
      className="inline-flex h-fit w-fit items-center gap-1.5 self-start whitespace-nowrap rounded-full px-[11px] py-[5px] text-[12.5px] font-bold md:justify-self-end"
      style={{ background: tone.bg, color: tone.fg }}
    >
      <span aria-hidden="true">{glyph}</span>
      {label}
    </span>
  );
}

export function MarketBrief() {
  return (
    <section className="block py-[88px] max-md:py-16" id="news" aria-labelledby="news-heading">
      <div className="wrap">
        <SectionHead
          eyebrow="In the news"
          title="What's moving the rate"
          headingId="news-heading"
        >
          We watch the headlines that actually nudge the AUD–VND rate, and tell
          you what each one means for your next payment.
        </SectionHead>

        <div
          className="mt-[22px] rounded-[18px] border border-line-strong px-[34px] py-[30px] max-md:px-5 max-md:py-6"
          style={{ background: "#FCFAF3" }}
        >
          <div className="flex items-baseline justify-between gap-3.5 border-b-[3px] border-double border-ink pb-3">
            <span className="text-[14px] font-bold uppercase tracking-[.2em]" style={{ fontFamily: "var(--font-accent)" }}>
              Sen Market Brief
            </span>
            <span className="whitespace-nowrap text-[13px] italic text-muted" style={{ fontFamily: "var(--font-accent)" }}>
              {BRIEF_DATE}
            </span>
          </div>
          <p className="border-b border-line py-2 text-center text-[13px] italic text-muted" style={{ fontFamily: "var(--font-accent)" }}>
            Recent news affecting Australian dollar → Vietnamese dong
          </p>

          <ul>
            {SAMPLE_BRIEF.map((item) => (
              <li
                key={item.headline}
                className="grid items-start gap-5 border-b border-line py-[18px] last:border-b-0 md:grid-cols-[62px_1fr_128px] max-md:gap-2"
              >
                <span className="pt-0.5 text-[13px] text-muted max-md:order-first" style={{ fontFamily: "var(--font-accent)" }}>
                  {item.date}
                </span>
                <div>
                  <h3 className="mb-1 text-[18px] font-bold leading-[1.22]" style={{ fontFamily: "var(--font-accent)" }}>
                    {item.headline}
                  </h3>
                  <p className="text-[14px] text-muted">{item.meaning}</p>
                  <span className="mt-[7px] inline-block text-[11px] uppercase tracking-[.1em] text-muted">
                    {item.source}
                  </span>
                </div>
                <ImpactChip impact={item.impact} />
              </li>
            ))}
          </ul>

          <div className="mt-1 flex items-center justify-between gap-3.5 border-t-[3px] border-double border-ink pt-3.5">
            <span className="flex items-center gap-2 text-[13px] text-muted">
              <span
                className="h-2 w-2 rounded-full bg-jade-bright"
                style={{ boxShadow: "0 0 0 4px rgba(28,138,104,.18)" }}
                aria-hidden="true"
              />
              Updated daily once you&apos;re signed in
            </span>
            <a href="/sign-in" className="text-[14px] font-semibold text-jade hover:text-jade-deep">
              Read the full brief →
            </a>
          </div>
        </div>
        <p className="mt-3 text-center text-[12.5px] text-muted">
          Sample headlines shown for illustration.
        </p>
      </div>
    </section>
  );
}
