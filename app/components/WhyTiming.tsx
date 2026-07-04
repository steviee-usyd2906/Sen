import { LotusMotif } from "./LotusMotif";

export function WhyTiming() {
  return (
    <section className="block py-[88px]" id="why" aria-labelledby="why-heading">
      <div className="wrap">
        <div className="relative grid items-center gap-12 overflow-hidden rounded-[28px] bg-ink p-[54px] text-[#EFEAD9] md:grid-cols-2 max-md:p-[38px]">
          <LotusMotif
            size={340}
            stroke="var(--color-gold)"
            className="pointer-events-none absolute -bottom-14 -right-10 opacity-[.08]"
          />
          <div>
            <span className="eyebrow" style={{ color: "var(--color-gold)" }}>
              Why timing matters
            </span>
            <h2
              id="why-heading"
              className="my-3 text-[clamp(28px,3.6vw,40px)] font-bold text-white"
            >
              On a semester&apos;s fees, timing is real money.
            </h2>
            <p className="text-[18px]" style={{ color: "#C9CFC2" }}>
              A tuition invoice gives you weeks before the deadline — and inside
              that window the rate keeps moving. The same A$15,000 invoice can
              cost millions of đồng more on a weak week than a strong one. Sen
              watches your window and points out the strong days, always well
              before the due date.
            </p>
          </div>
          <div className="flex flex-col gap-3.5">
            <CompareCard
              k="Paid on a strong week"
              v="₫238.5M"
              barColor="var(--color-jade-bright)"
              barWidth="88%"
              note="An A$15,000 semester invoice on the best week this year"
            />
            <CompareCard
              k="Paid on a weak week"
              v="₫247.5M"
              barColor="var(--color-clay)"
              barWidth="100%"
              note="The same invoice on the weakest week — about ₫9,000,000 more"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function CompareCard({
  k,
  v,
  barColor,
  barWidth,
  note,
}: {
  k: string;
  v: string;
  barColor: string;
  barWidth: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[.12] bg-white/[.05] px-5 py-[18px]">
      <div className="flex items-center justify-between">
        <span className="text-[14px]" style={{ color: "#AEB7A9" }}>
          {k}
        </span>
        <span className="font-display text-[22px] font-bold">{v}</span>
      </div>
      <div className="mt-3 h-[9px] overflow-hidden rounded-md bg-white/10">
        <span
          className="block h-full rounded-md"
          style={{ background: barColor, width: barWidth }}
        />
      </div>
      <div className="mt-1.5 text-[13px]" style={{ color: "#9aa394" }}>
        {note}
      </div>
    </div>
  );
}
