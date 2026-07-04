import type { Metadata } from "next";
import { SiteNav } from "../components/SiteNav";
import { SiteFooter } from "../components/SiteFooter";
import { AuthForm } from "../components/AuthForm";

export const metadata: Metadata = {
  title: "Sign in — Sen",
  description:
    "Sign in to Sen or create a free account to time your transfers between Australia and Việt Nam.",
};

// Auth backed by app/lib/security (Argon2id password storage, secure
// sessions, lockout, audit log — the INFO2222 security model). Runs on
// an in-memory store until the database is connected; see scripts/*.sql.
export default function SignInPage() {
  return (
    <>
      <SiteNav />
      <main id="top">
        <section className="py-[72px] max-md:py-12">
          <div className="wrap max-w-[560px] text-center">
            <span className="eyebrow">Accounts</span>
            <h1 className="my-[14px] text-[clamp(30px,4vw,44px)] font-bold leading-[1.1]">
              Welcome to Sen.
            </h1>
            <p className="mb-7 text-[17px] text-muted">
              One account for the daily read, deadline watch, and good-day
              alerts. Free to start — no card needed.
            </p>
            <AuthForm />
            <p className="mt-7 text-[14px] text-muted">
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
