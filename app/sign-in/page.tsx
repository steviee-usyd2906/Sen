import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "../components/SiteNav";
import { SiteFooter } from "../components/SiteFooter";

export const metadata: Metadata = {
  title: "Sign in — Sen",
  description:
    "Sen accounts are coming soon. The marketing site is live; sign-in and alerts will follow shortly.",
};

// Honest placeholder: real authentication is intentionally not built yet
// (see COMPLETION_PLAN.md, Phases B–G). This page only exists so the
// "Sign in" / "Get started free" links resolve instead of dead-ending.
export default function SignInPage() {
  return (
    <>
      <SiteNav />
      <main id="top">
        <section className="py-[96px] max-md:py-16">
          <div className="wrap max-w-[52ch] text-center">
            <span className="eyebrow">Accounts</span>
            <h1 className="my-[18px] text-[clamp(30px,4vw,44px)] font-bold leading-[1.1]">
              Sign-in is coming soon.
            </h1>
            <p className="mb-6 text-[18px] text-muted">
              Sen accounts aren&apos;t live just yet. We&apos;re building secure
              sign-in, saved preferences, and good-time alerts now — and
              you&apos;ll be able to create an account here soon.
            </p>
            <p className="mb-8 text-[16px] text-muted">
              In the meantime, take a look at how Sen helps you{" "}
              <Link
                href="/#how"
                className="font-semibold text-jade hover:text-jade-deep"
              >
                send at the right time
              </Link>
              .
            </p>
            <div className="flex flex-wrap justify-center gap-3.5">
              <Link href="/#how" className="btn btn-primary">
                See how it works
              </Link>
              <Link href="/contact" className="btn btn-ghost">
                Get in touch
              </Link>
            </div>
            <p className="mt-8 text-[14px] text-muted">
              Sen provides rate forecasts and alerts, not financial advice or
              money transfer.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
