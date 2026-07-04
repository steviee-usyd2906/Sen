import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { LotusMotif } from "./LotusMotif";

const COLS = [
  {
    heading: "Product",
    links: [
      { href: "/#how", label: "How it works" },
      { href: "/#faq", label: "FAQ" },
      { href: "/sign-in", label: "Sign in" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-[88px] overflow-hidden border-t border-line pb-10 pt-[60px]">
      <LotusMotif
        size={320}
        className="pointer-events-none absolute -bottom-16 right-[4%] opacity-[.07]"
      />
      <div className="wrap relative">
        <div className="mb-[34px] grid grid-cols-2 gap-8 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div className="max-md:col-span-2">
            <Link
              href="/#top"
              className="flex items-center gap-2.5 font-display text-[21px] font-bold"
            >
              <BrandMark size={26} />
              Sen
            </Link>
            <p
              lang="vi"
              className="mt-2.5 text-[14.5px] italic text-jade-deep"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              {/* TODO(copy): tagline still needs native-speaker sign-off. */}
              Gửi đúng lúc — về được nhiều hơn
            </p>
            <p className="mt-2 max-w-[34ch] text-[14px] text-muted">
              Helping families pay for study in Australia — and send money home
              — at the right moment.
            </p>
          </div>
          {COLS.map((col) => (
            <div key={col.heading}>
              <h4 className="mb-3.5 text-[13px] uppercase tracking-[.08em] text-ink">
                {col.heading}
              </h4>
              {col.links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="mb-[9px] block text-[14px] text-muted transition-colors hover:text-ink"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-between gap-4 border-t border-line pt-[22px] text-[13px] text-muted">
          <span>© 2026 Sen. Made for the Australia–Vietnam community.</span>
          <span>
            Sen provides rate forecasts and alerts, not financial advice or
            money transfer.
          </span>
        </div>
      </div>
    </footer>
  );
}
