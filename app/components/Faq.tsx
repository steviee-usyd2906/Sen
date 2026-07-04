import { SectionHead } from "./SectionHead";

const QUESTIONS = [
  {
    q: "Can I use Sen for tuition deadlines?",
    a: "That's exactly what it's for. Tell Sen the amount and the due date — census day, an OSHC renewal, rent day — and we watch the rate inside that window. We'll nudge you on strong days, always with time to spare. Sen will never suggest waiting past a deadline: paying on time beats any rate.",
    open: true,
  },
  {
    q: "Do you transfer my money?",
    a: "No — and that's on purpose. Sen tells you when the rate looks good, then you pay through your bank, a transfer service, or your university's own payment portal. That keeps you free to use whoever gives you the best deal on the day.",
  },
  {
    q: "How accurate are the forecasts?",
    a: "We'll always be honest with you: no one can predict currencies perfectly. Sen shows a range for where the rate could land, the most likely path through it, and how confident we are — so you can make a calmer decision instead of guessing. When there's no clear signal, we say so.",
  },
  {
    q: "Which currencies do you cover?",
    a: "Australian dollars and Vietnamese đồng — both directions: paying fees in Australia, or sending money home to Việt Nam. It's the pair we know best.",
  },
  {
    q: "Is it really free to start?",
    a: "Yes. The daily read and forecast are free, with no card needed. Plus adds deadline watch and real-time alerts when you're ready.",
  },
];

export function Faq() {
  return (
    <section className="block py-[88px] max-md:py-16" id="faq" aria-labelledby="faq-heading">
      <div className="wrap">
        <SectionHead eyebrow="Questions" title="Good to know" headingId="faq-heading" centered />
        <div className="mx-auto mt-[18px] max-w-[780px]">
          {QUESTIONS.map((item) => (
            <details
              key={item.q}
              open={item.open}
              className="faq-item group border-b border-line px-1 py-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-[19px] font-semibold [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-line-strong transition-[transform,background,color] duration-200 group-open:rotate-45 group-open:border-jade group-open:bg-jade group-open:text-white"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-[64ch] text-[16px] text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
