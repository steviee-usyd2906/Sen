import { SectionHead } from "./SectionHead";

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-[3px] shrink-0 text-jade-bright" aria-hidden="true">
      <path d="M3 8.5 6.5 12 13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface Plan {
  name: string;
  price: string;
  per?: string;
  tag: string;
  features: string[];
  cta: string;
  ctaVariant: "primary" | "ghost";
  featured?: boolean;
}

const PLANS: Plan[] = [
  {
    name: "Free",
    price: "$0",
    tag: "For the occasional transfer",
    features: ["Today's good-day read", "A daily forecast", "Weekly email summary"],
    cta: "Get started",
    ctaVariant: "ghost",
  },
  {
    name: "Plus",
    price: "$6",
    per: "/month",
    tag: "For families with fees to pay",
    features: [
      "Deadline watch for tuition, rent & OSHC",
      "Real-time good-day alerts",
      "Forecasts up to a month ahead",
      "Savings tracker — what timing saved you",
    ],
    cta: "Choose Plus",
    ctaVariant: "primary",
    featured: true,
  },
  {
    name: "Business",
    price: "Let's talk",
    tag: "For education agents & businesses",
    features: ["Everything in Plus", "Forecasts in your own tools", "Team accounts & support"],
    cta: "Contact us",
    ctaVariant: "ghost",
  },
];

export function Pricing() {
  return (
    <section className="block py-[88px] max-md:py-16" id="pricing" aria-labelledby="pricing-heading">
      <div className="wrap">
        <SectionHead
          eyebrow="Pricing"
          title="Start free. Upgrade when it pays for itself."
          headingId="pricing-heading"
        >
          One well-timed semester payment can cover years of Plus.
        </SectionHead>
        <div className="mt-[18px] grid items-stretch gap-[22px] md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-[22px] bg-card p-6 sm:p-[30px] ${
                plan.featured
                  ? "border-2 border-jade shadow-[var(--shadow-lift)] max-md:order-first"
                  : "border border-line"
              }`}
            >
              {plan.featured ? (
                <span className="absolute -top-[13px] left-1/2 -translate-x-1/2 rounded-full bg-jade px-3.5 py-[5px] text-[12px] font-bold text-white">
                  Most popular
                </span>
              ) : null}
              <h3 className="mb-1 text-[19px] font-semibold">{plan.name}</h3>
              <div className="my-1.5 font-display text-[42px] font-bold">
                {plan.price}
                {plan.per ? (
                  <span className="font-sans text-[16px] font-medium text-muted">
                    {plan.per}
                  </span>
                ) : null}
              </div>
              <div className="mb-[18px] text-[14px] text-muted">{plan.tag}</div>
              <ul className="mb-6 flex flex-col gap-[11px]">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[15px]">
                    <Check />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`btn mt-auto w-full ${
                  plan.ctaVariant === "primary" ? "btn-primary" : "btn-ghost"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
