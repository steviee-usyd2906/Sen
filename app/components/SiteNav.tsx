import Link from "next/link";
import { BrandMark } from "./BrandMark";

// Root-relative so these resolve from sub-pages (e.g. /about) too, not just "/".
const LINKS = [
  { href: "/#how", label: "How it works" },
  { href: "/#why", label: "Why timing" },
  { href: "/#news", label: "News" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-[60] border-b border-line bg-paper/80 backdrop-blur-md">
      <div className="wrap flex h-[68px] items-center gap-7">
        <Link
          href="/#top"
          className="flex items-center gap-2.5 font-display text-[21px] font-bold"
        >
          <BrandMark />
          Sen
        </Link>
        <nav aria-label="Primary" className="ml-2.5 hidden gap-6 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[15px] font-medium text-muted transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/sign-in" className="hidden text-[15px] font-semibold sm:block">
            Sign in
          </Link>
          <Link href="/sign-in" className="btn btn-primary btn-sm">
            Get started free
          </Link>
        </div>
      </div>
      {/* Mobile: a swipeable link row instead of a hamburger — one tap, no JS. */}
      <nav
        aria-label="Primary (mobile)"
        className="wrap flex gap-5 overflow-x-auto pb-2.5 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] md:hidden"
      >
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="whitespace-nowrap py-1 text-[14px] font-medium text-muted"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
