import { SectionHead } from "./SectionHead";

const STEPS = [
  {
    n: "1",
    title: "Tell us what's due",
    body: "The amount on the invoice and when it's due — tuition, rent, or living costs. Takes a few seconds.",
  },
  {
    n: "2",
    title: "We watch the window",
    body: "Between now and the due date, we check the rate daily and show whether to pay now or wait — in plain words, no charts to decode.",
  },
  {
    n: "3",
    title: "Pay on a good day",
    body: "We nudge you when the rate looks strong, always with time to spare. You pay through your bank or the university's portal, as usual.",
  },
];

export function HowItWorks() {
  return (
    <section
      className="block border-y border-line bg-paper-2/60 py-[88px] max-md:py-16"
      id="how"
      aria-labelledby="how-heading"
    >
      <div className="wrap">
        <SectionHead
          eyebrow="How it works"
          title="Three steps. No finance degree required."
          headingId="how-heading"
        >
          Set it up once — then Sen watches the rate so you don&apos;t have to.
        </SectionHead>
        <div className="mt-[18px] grid gap-[22px] md:grid-cols-3">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="rounded-[20px] border border-line bg-card p-7"
            >
              <div className="mb-4 flex h-[34px] w-[34px] items-center justify-center rounded-[10px] font-display text-[15px] font-bold text-jade" style={{ background: "rgba(28,138,104,.12)" }}>
                {s.n}
              </div>
              <h3 className="mb-2 text-[20px] font-semibold">{s.title}</h3>
              <p className="text-[15px] text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
