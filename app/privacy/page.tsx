import type { Metadata } from "next";
import { SiteNav } from "../components/SiteNav";
import { SiteFooter } from "../components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy — Sen",
  description:
    "How Sen handles your information. We collect only what we need to send you rate forecasts and alerts, and we never move your money.",
};

export default function PrivacyPage() {
  return (
    <>
      <SiteNav />
      <main id="top">
        <section className="py-[74px] max-md:py-12">
          <div className="wrap max-w-[72ch]">
            <span className="eyebrow">Legal</span>
            <h1 className="my-[18px] text-[clamp(32px,4.2vw,46px)] font-bold leading-[1.1]">
              Privacy Policy
            </h1>
            <p className="mb-6 text-[15px] text-muted">Last updated: 13 June 2026</p>

            <p className="mb-4 text-[17px] text-muted">
              This policy explains what information Sen collects, why we collect
              it, and how we use it. We keep this short and in plain language on
              purpose. If anything here is unclear, please contact us.
            </p>

            <h2 className="mb-3 mt-10 text-[26px] font-bold">
              Information we collect
            </h2>
            <p className="mb-4 text-[17px] text-muted">
              When you create an account we collect your email address and the
              preferences you choose — such as a typical amount you send and the
              direction you send it. If you set up alerts, we store the target
              you ask us to watch for. We do not ask for your bank details, and
              we never see or handle the money you transfer.
            </p>

            <h2 className="mb-3 mt-10 text-[26px] font-bold">
              How we use your information
            </h2>
            <ul className="mb-4 list-disc space-y-2 pl-6 text-[17px] text-muted">
              <li>To send you the rate forecasts and verdicts you ask for.</li>
              <li>To notify you when an alert you set is triggered.</li>
              <li>To keep your account secure and respond to your questions.</li>
            </ul>
            <p className="mb-4 text-[17px] text-muted">
              We do not sell your personal information, and we do not share it
              with advertisers.
            </p>

            <h2 className="mb-3 mt-10 text-[26px] font-bold">Your choices</h2>
            <p className="mb-4 text-[17px] text-muted">
              You can update your preferences or delete your account at any time.
              When you delete your account, we remove your personal information
              from our active systems. You can also unsubscribe from alert and
              summary emails using the link in any of those emails.
            </p>

            <h2 className="mb-3 mt-10 text-[26px] font-bold">Contact</h2>
            <p className="mb-8 text-[17px] text-muted">
              Questions about your privacy? Reach us through our{" "}
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
