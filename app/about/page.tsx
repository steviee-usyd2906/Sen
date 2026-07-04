import type { Metadata } from "next";
import { SiteNav } from "../components/SiteNav";
import { SiteFooter } from "../components/SiteFooter";

export const metadata: Metadata = {
  title: "About — Sen",
  description:
    "Sen helps the Australia–Vietnam community send at the right moment. We tell you when it looks like a good day to convert AUD to VND — we don't move your money.",
};

export default function AboutPage() {
  return (
    <>
      <SiteNav />
      <main id="top">
        <section className="py-[74px] max-md:py-12">
          <div className="wrap max-w-[72ch]">
            <span className="eyebrow">Our story</span>
            <h1 className="my-[18px] text-[clamp(34px,4.6vw,52px)] font-bold leading-[1.08]">
              Built for families sending between Australia and Vietnam.
            </h1>
            <p className="mb-6 text-[19px] text-muted">
              The Australian dollar to Vietnamese dong rate moves every single
              day. Over a year, the difference between a good day and a poor one
              can be hundreds of thousands of dong on the same transfer. Most
              people sending money home never get to see that — so they send
              whenever they remember, and quietly lose out.
            </p>

            <h2 className="mb-3 mt-10 text-[28px] font-bold">Why we started Sen</h2>
            <p className="mb-4 text-[17px] text-muted">
              Sen began with a simple frustration shared across the
              Australia–Vietnam community: there was no plain-language way to
              know whether today was a good day to convert. The information
              existed, but it was buried in charts and trader jargon that
              weren&apos;t meant for someone sending money to their parents in Đà
              Nẵng.
            </p>
            <p className="mb-4 text-[17px] text-muted">
              So we built one thing, and tried to do it well: a daily read on the
              AUD–VND rate that anyone can understand. A clear verdict, a plain
              reason, and a sense of whether waiting a few days might mean more
              dong arriving on the other end.
            </p>

            <h2 className="mb-3 mt-10 text-[28px] font-bold">What Sen does</h2>
            <p className="mb-4 text-[17px] text-muted">
              Sen watches the rate and the headlines that nudge it, then tells
              you when it looks like a good day to send. That&apos;s it. We give
              you a verdict, a reason, and alerts — so more of your money reaches
              the people you love.
            </p>

            <h2 className="mb-3 mt-10 text-[28px] font-bold">
              What Sen does not do
            </h2>
            <p className="mb-4 text-[17px] text-muted">
              Sen does not move your money. We are not a bank or a money transfer
              service, and we never touch your funds. When you decide to send,
              you transfer with your own bank or remittance service, exactly as
              you do today. Our forecasts are estimates to help you choose the
              moment — not financial advice, and not a guarantee.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
