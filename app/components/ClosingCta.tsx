import { LotusMotif } from "./LotusMotif";

export function ClosingCta() {
  return (
    <section className="block py-[88px] max-md:py-16" aria-labelledby="cta-heading">
      <div className="wrap">
        <div
          className="relative overflow-hidden rounded-[28px] p-16 text-center text-white max-md:p-[34px]"
          style={{
            background:
              "linear-gradient(135deg, var(--color-jade) 0%, var(--color-jade-deep) 100%)",
          }}
        >
          <div
            className="pointer-events-none absolute -bottom-40 -right-16 h-[340px] w-[340px] rounded-full"
            style={{ background: "rgba(216,154,42,.22)" }}
            aria-hidden="true"
          />
          <LotusMotif
            size={280}
            stroke="#ffffff"
            className="pointer-events-none absolute -left-10 -top-12 opacity-[.10]"
          />
          <h2
            id="cta-heading"
            className="relative mb-3.5 text-[clamp(28px,4vw,44px)] font-bold text-white"
          >
            The next invoice has a good day in it. Let Sen find it.
          </h2>
          <p className="relative mb-7 text-[18px] text-white/[.82]">
            Your first read takes under a minute. Free, no card — and nothing
            for your child to set up.
          </p>
          <button
            className="btn relative bg-white text-jade-deep hover:bg-paper hover:-translate-y-px"
          >
            Get started free
          </button>
        </div>
      </div>
    </section>
  );
}
