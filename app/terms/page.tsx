import type { Metadata } from "next";
import { SiteNav } from "../components/SiteNav";
import { SiteFooter } from "../components/SiteFooter";

export const metadata: Metadata = {
  title: "Terms of Service — Sen",
  description:
    "The terms for using Sen. Sen provides rate forecasts and alerts only — it is not financial advice and does not move your money.",
};

export default function TermsPage() {
  return (
    <>
      <SiteNav />
      <main id="top">
        <section className="py-[74px] max-md:py-12">
          <div className="wrap max-w-[72ch]">
            <span className="eyebrow">Legal</span>
            <h1 className="my-[18px] text-[clamp(32px,4.2vw,46px)] font-bold leading-[1.1]">
              Terms of Service
            </h1>
            <p className="mb-6 text-[15px] text-muted">Last updated: 13 June 2026</p>

            <p className="mb-4 text-[17px] text-muted">
              These terms cover your use of Sen. By using Sen, you agree to them.
              We&apos;ve kept them short and readable.
            </p>

            <h2 className="mb-3 mt-10 text-[26px] font-bold">What Sen is</h2>
            <p className="mb-4 text-[17px] text-muted">
              Sen is an information service. We watch the Australian dollar to
              Vietnamese dong rate and tell you when it looks like a good day to
              convert, with a plain verdict and reason, plus alerts you can set.
              That is the whole of what we provide.
            </p>

            <h2 className="mb-3 mt-10 text-[26px] font-bold">
              Sen does not move money or give financial advice
            </h2>
            <p className="mb-4 text-[17px] text-muted">
              Sen is not a bank, a financial adviser, or a money transfer
              service, and Sen does not move your money. Our forecasts and
              verdicts are estimates to help you choose a moment — they are not
              financial advice and not a guarantee of any rate or outcome. When
              you decide to send, you do so through your own bank or money
              service, and any decision to transfer is yours alone.
            </p>

            <h2 className="mb-3 mt-10 text-[26px] font-bold">Your account</h2>
            <p className="mb-4 text-[17px] text-muted">
              You are responsible for keeping your account secure and for the
              accuracy of the preferences you give us. Please use Sen lawfully
              and don&apos;t attempt to disrupt or misuse the service.
            </p>

            <h2 className="mb-3 mt-10 text-[26px] font-bold">
              Plans and changes
            </h2>
            <p className="mb-4 text-[17px] text-muted">
              Some features may be offered as part of a paid plan. We may update
              these terms or the service over time; if we make a significant
              change, we&apos;ll do our best to let you know.
            </p>

            <h2 className="mb-3 mt-10 text-[26px] font-bold">Contact</h2>
            <p className="mb-8 text-[17px] text-muted">
              Questions about these terms? Reach us through our{" "}
              <a href="/contact" className="font-semibold text-jade hover:text-jade-deep">
                contact page
              </a>
              .
            </p>

            <div className="card p-5 text-[15px] text-muted">
              <b className="font-semibold text-ink">Important.</b> Sen provides
              rate forecasts and alerts only. It is not financial advice, and Sen
              does not move money. You always transfer with your own bank or
              money service. Forecasts are estimates, not guarantees.
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
