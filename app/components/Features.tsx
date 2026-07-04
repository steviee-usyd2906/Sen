import { SectionHead } from "./SectionHead";

const FEATURES = [
  {
    title: "Deadline watch",
    body: "Give us the due date — census day, rent day, OSHC renewal. We watch the rate until then and never suggest cutting it fine.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="4" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 9h16M7 2v4M15 2v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="14.5" cy="14" r="1.4" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Forecasts in plain words",
    body: "No candlestick charts. Just whether it's a good day, what the range looks like, and a sentence on why.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 14h4l3-7 4 13 2-6h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Both directions",
    body: "Paying fees in Australia or sending money home to Việt Nam — same forecast, read both ways.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 8h12M12 4l4 4-4 4M18 14H6M10 18l-4-4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "See what timing saved you",
    body: "Look back at every payment and what a well-picked day was worth — in đồng, not percentages.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
        <path d="M11 6v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function Features() {
  return (
    <section className="block py-[88px] max-md:py-16" aria-labelledby="features-heading">
      <div className="wrap">
        <SectionHead
          eyebrow="What you get"
          title="Everything to pay with confidence."
          headingId="features-heading"
        />
        <div className="mt-[18px] grid gap-5 md:grid-cols-2">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex gap-4 rounded-[18px] border border-line bg-card p-6"
            >
              <div
                className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[13px] text-jade"
                style={{ background: "var(--color-paper-2)" }}
                aria-hidden="true"
              >
                {f.icon}
              </div>
              <div>
                <h3 className="mb-[5px] text-[18px] font-semibold">{f.title}</h3>
                <p className="text-[15px] text-muted">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-[26px] text-center text-[15px] text-muted">
          <b className="font-semibold text-ink">One honest note:</b> Sen
          doesn&apos;t move your money. We tell you when the rate looks good —
          you pay through your bank, transfer service, or the university&apos;s
          own portal, whichever gives you the best deal.
        </p>
      </div>
    </section>
  );
}
