"use client";

// Login / register form — the sen-styled equivalent of INFO2222's
// app/login and app/register pages, calling our own auth API
// (which does Argon2id + sessions) instead of supabase.auth directly.
import { useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "sign-in" | "register";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Something went wrong.");
          return;
        }
        setNotice("Account created — you can sign in now.");
        setMode("sign-in");
        setPassword("");
        return;
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Network problem — please try again.");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "w-full rounded-[14px] border border-line bg-paper px-3.5 py-3 text-[16px] text-ink outline-none focus:border-jade";

  return (
    <form onSubmit={handleSubmit} className="card mx-auto max-w-[420px] p-6 text-left sm:p-7">
      <div
        role="group"
        aria-label="Sign in or create an account"
        className="mb-5 grid grid-cols-2 gap-1 rounded-full border border-line bg-paper p-1"
      >
        {(
          [
            ["sign-in", "Sign in"],
            ["register", "Create account"],
          ] as [Mode, string][]
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => {
              setMode(m);
              setError(null);
              setNotice(null);
            }}
            className={`rounded-full px-2 py-2 text-[13.5px] font-semibold transition-colors ${
              mode === m ? "bg-jade text-white shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "register" ? (
        <label className="mb-3.5 block">
          <span className="mb-1.5 block text-[13.5px] font-semibold text-ink">
            Username
          </span>
          <input
            type="text"
            required
            minLength={3}
            maxLength={50}
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputClass}
          />
        </label>
      ) : null}

      <label className="mb-3.5 block">
        <span className="mb-1.5 block text-[13.5px] font-semibold text-ink">
          Email
        </span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="mb-5 block">
        <span className="mb-1.5 block text-[13.5px] font-semibold text-ink">
          Password
        </span>
        <input
          type="password"
          required
          minLength={8}
          maxLength={128}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          placeholder={mode === "register" ? "At least 8 characters" : undefined}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </label>

      {error ? (
        <p role="alert" className="mb-4 rounded-[10px] px-3.5 py-2.5 text-[14px] font-semibold"
          style={{ background: "rgba(188,83,64,.1)", color: "var(--color-clay)" }}>
          {error}
        </p>
      ) : null}
      {notice ? (
        <p role="status" className="mb-4 rounded-[10px] px-3.5 py-2.5 text-[14px] font-semibold"
          style={{ background: "rgba(28,138,104,.1)", color: "var(--color-jade-deep)" }}>
          {notice}
        </p>
      ) : null}

      <button type="submit" disabled={busy} className="btn btn-primary w-full disabled:opacity-60">
        {busy ? "One moment…" : mode === "register" ? "Create account" : "Sign in"}
      </button>

      <p className="mt-4 text-center text-[12.5px] text-muted">
        Passwords are stored with Argon2id hashing — we can never read them.
      </p>
    </form>
  );
}
