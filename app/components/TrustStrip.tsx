// Trust signals for a TIMING ADVISOR, not a money mover: independence,
// honesty about uncertainty, and data depth. Deliberately no padlocks,
// shields, or "bank-level security" clichés — Sen never holds funds,
// so the honest claim is stronger than the borrowed one.
const ITEMS = [
  {
    label: "Your money never touches Sen — you transfer with your own bank",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="4" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="14" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.6" />
        <path d="M7 9h4m0 0-1.5-1.5M11 9l-1.5 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "We say “no clear signal” when there isn’t one",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 4.5h12a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H8l-3.5 3v-3H3a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M6 8.5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "20+ years of daily AUD–VND rates behind every call",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9 5v4l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "A fresh forecast every day, free to check",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M2 7h14" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
];

export function TrustStrip() {
  return (
    <div className="border-y border-line bg-paper-2">
      <div className="wrap grid gap-x-10 gap-y-3 py-[22px] sm:grid-cols-2 lg:flex lg:flex-wrap lg:justify-between">
        {ITEMS.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-[11px] text-[14.5px] font-medium text-ink"
          >
            <span className="shrink-0 text-jade" aria-hidden="true">
              {item.icon}
            </span>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
