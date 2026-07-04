import { BrandMark } from "./BrandMark";

// A word from a parent, presented as the object every family with someone
// far away knows by heart: an airmail postcard. Par-avion striped edge,
// lotus stamp, postmark, a slight tilt — warmth over polish.
// TODO(copy): placeholder story — replace with a real customer quote
// (or label as illustrative) before launch.
export function Testimonial() {
  return (
    <section className="block py-[88px] max-md:py-16" aria-label="Customer story">
      <div className="wrap">
        <div className="airmail mx-auto max-w-[720px] rotate-[-1.2deg] rounded-[18px] p-[7px] shadow-[var(--shadow-lift)] transition-transform duration-200 hover:rotate-0">
          <div className="relative rounded-[12px] bg-[#fffdf8] px-8 py-9 sm:px-11 max-md:px-5 max-md:py-7">
            {/* stamp + postmark */}
            <div className="pointer-events-none absolute right-6 top-6 flex items-start gap-3 max-md:right-4 max-md:top-4">
              <svg
                width="74"
                height="46"
                viewBox="0 0 74 46"
                fill="none"
                aria-hidden="true"
                className="mt-1 -rotate-6 opacity-70 max-md:hidden"
              >
                <circle cx="23" cy="23" r="20" stroke="var(--color-muted)" strokeWidth="1.3" strokeDasharray="3 3" />
                <text x="23" y="20" textAnchor="middle" fontSize="7" fill="var(--color-muted)" style={{ letterSpacing: ".1em" }}>
                  TP.HCM
                </text>
                <text x="23" y="30" textAnchor="middle" fontSize="7" fill="var(--color-muted)" style={{ letterSpacing: ".1em" }}>
                  ✈ SYDNEY
                </text>
                <path d="M46 14c8-2 18-2 26 0M46 23c8-2 18-2 26 0M46 32c8-2 18-2 26 0" stroke="var(--color-muted)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <span
                className="flex h-[58px] w-[48px] rotate-3 flex-col items-center justify-center gap-1 rounded-[3px] border border-dashed border-line-strong bg-paper"
                aria-hidden="true"
              >
                <BrandMark size={24} />
                <span className="text-[8px] font-bold tracking-[.18em] text-jade-deep">
                  SEN
                </span>
              </span>
            </div>

            <blockquote
              className="mb-6 max-w-[24ch] text-[clamp(20px,2.6vw,27px)] font-medium italic leading-[1.4] text-ink sm:max-w-[30ch]"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              &ldquo;Our daughter is at university in Sydney. Sen told us to pay
              her Semester 1 fees <span className="text-gold-deep">a week
              early</span> — that one nudge saved us about ₫7,000,000.&rdquo;
            </blockquote>

            <div className="flex items-center gap-3 border-t border-dashed border-line-strong pt-5">
              <div
                className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-jade font-display font-bold text-white"
                aria-hidden="true"
              >
                H
              </div>
              <div className="text-left text-[14px]">
                <b className="block font-bold" lang="vi">
                  Cô Hằng
                </b>
                <span className="text-muted">
                  <span lang="vi">TP. Hồ Chí Minh</span> · Daughter studying in
                  Sydney
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
