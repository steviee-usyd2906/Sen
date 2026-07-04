import type { Metadata } from "next";
import { SiteNav } from "../components/SiteNav";
import { SiteFooter } from "../components/SiteFooter";

// PLACEHOLDER: hello@sen.example is a stand-in support address. Swap it for the
// real verified inbox once the domain is live (also referenced in RESEND_FROM_EMAIL).
const SUPPORT_EMAIL = "hello@sen.example";

export const metadata: Metadata = {
  title: "Contact — Sen",
  description:
    "Get in touch with the Sen team. We're a small group helping the Australia–Vietnam community send at the right time.",
};

export default function ContactPage() {
  return (
    <>
      <SiteNav />
      <main id="top">
        <section className="py-[74px] max-md:py-12">
          <div className="wrap max-w-[64ch]">
            <span className="eyebrow">Contact</span>
            <h1 className="my-[18px] text-[clamp(34px,4.6vw,52px)] font-bold leading-[1.08]">
              We&apos;d love to hear from you.
            </h1>
            <p className="mb-6 text-[19px] text-muted">
              Questions, feedback, or a story about sending money home? Reach the
              Sen team directly by email and we&apos;ll get back to you.
            </p>

            <div className="card p-6">
              <h2 className="mb-1 text-[20px] font-bold">Email us</h2>
              <p className="mb-4 text-[15px] text-muted">
                The fastest way to reach a real person on the team.
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="btn btn-primary"
              >
                Email {SUPPORT_EMAIL}
              </a>
            </div>

            <p className="mt-6 text-[14px] text-muted">
              Sen provides rate forecasts and alerts, not financial advice or
              money transfer. We never move your money.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
