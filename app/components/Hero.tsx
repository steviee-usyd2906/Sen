import Image from "next/image";
import { getForecast, getHistory } from "../lib/forecast-source";
import { LotusMotif } from "./LotusMotif";
import { VerdictCard } from "./VerdictCard";

export async function Hero() {
  // Read forecast data through the source seam (sample data until the model is
  // wired via NEXT_PUBLIC_API_URL). VerdictCard is a client component, so the
  // data is fetched here in the server parent and passed down as props.
  const [forecast, history] = await Promise.all([getForecast(), getHistory()]);

  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-heading">
      {/* soft jade glow, decorative */}
      <div
        className="pointer-events-none absolute -right-[10%] -top-[30%] -z-0 h-[780px] w-[780px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(28,138,104,.16), transparent 62%)",
        }}
        aria-hidden="true"
      />
      <div className="wrap relative z-[1] grid items-center gap-10 py-11 md:grid-cols-[1.05fr_.95fr] md:gap-[54px] md:py-[74px] md:pb-[84px]">
        <div>
          <span className="eyebrow">
            For parents with a child studying in Australia
          </span>
          <h1
            id="hero-heading"
            className="my-[18px] text-[clamp(38px,5.4vw,62px)] font-bold leading-[1.05]"
          >
            Pay your child&apos;s uni fees when the rate is{" "}
            <span className="relative whitespace-nowrap text-jade">
              on your side.
              {/* hand-drawn brush stroke, not a machine-straight bar */}
              <svg
                className="absolute inset-x-0 -z-[1] w-full"
                style={{ bottom: "-0.02em", height: ".22em" }}
                viewBox="0 0 200 14"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M4 9.5 C36 4.5 74 11 112 7 C146 3.5 176 8 196 5.5"
                  stroke="var(--color-gold)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                  opacity=".55"
                />
              </svg>
            </span>
          </h1>
          {/* Vietnamese signature line — identity, not translation. Set in the
              Lora accent face so it reads as deliberate alongside the English.
              TODO(copy): NEW parent-facing line — needs native-speaker
              sign-off before shipping (as does the footer tagline). */}
          <p
            lang="vi"
            className="mb-[22px] flex items-center gap-2.5 text-[19px] font-medium italic text-jade-deep"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            <span
              className="h-[2px] w-7 shrink-0 rounded-full bg-gold"
              aria-hidden="true"
            />
            Chuyển tiền cho con đúng lúc — tiết kiệm hàng triệu đồng
          </p>
          <p className="mb-[30px] max-w-[48ch] text-[19px] text-muted">
            Tuition and rent don&apos;t wait — but inside the deadline, the day
            you convert is yours to choose. The AUD–VND rate moves every day,
            and on a semester&apos;s fees a good day is worth millions of đồng.
            Sen watches the rate and tells you when.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3.5">
            <button className="btn btn-primary w-full sm:w-auto">
              Get started free
            </button>
            <a href="#how" className="btn btn-ghost w-full sm:w-auto">
              See how it works
            </a>
          </div>
          <p className="mt-[18px] flex items-center gap-2 text-[14px] text-muted">
            <span
              className="h-1.5 w-1.5 rounded-full bg-jade-bright"
              aria-hidden="true"
            />
            Free to start · Sen never holds your money
          </p>
          <p className="mt-2 text-[14px] text-muted">
            Sending money home instead? Sen works both ways — switch on the
            card.
          </p>

          {/* A real family, not a stat — the people every good-day nudge is
              for. Small framed print with a handwritten-feel caption. */}
          <figure className="mt-8 flex items-center gap-4">
            <div className="shrink-0 -rotate-3 rounded-[10px] border-[5px] border-card bg-card shadow-[var(--shadow-lift)]">
              <Image
                src="/family-moment.png"
                alt="A mother and her university-aged daughter looking at a phone together at home"
                width={124}
                height={100}
                className="h-[100px] w-[124px] rounded-[5px] object-cover"
                priority
              />
            </div>
            <figcaption className="text-[14px] leading-snug text-muted">
              <span
                lang="vi"
                className="mb-0.5 block text-[16px] italic text-jade-deep"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                “Con gái đang học ở Sydney.”
              </span>
              Families like Cô Hằng&apos;s already time their fees with Sen.
            </figcaption>
          </figure>
        </div>

        <div className="relative">
          {/* the namesake, rising quietly behind the card */}
          <LotusMotif
            size={300}
            className="absolute -right-12 -top-20 hidden opacity-[.13] md:block"
          />
          <VerdictCard forecast={forecast} history={history} />
        </div>
      </div>
    </section>
  );
}
