import Image from "next/image";
import { LotusMotif } from "./LotusMotif";

export function ClosingCta() {
  return (
    <section className="block py-[88px] max-md:py-16" aria-labelledby="cta-heading">
      <div className="wrap">
        <div
          className="relative grid overflow-hidden rounded-[28px] text-white md:grid-cols-[1.1fr_.9fr]"
          style={{
            background:
              "linear-gradient(135deg, var(--color-jade) 0%, var(--color-jade-deep) 100%)",
          }}
        >
          <div
            className="pointer-events-none absolute -bottom-40 -left-16 h-[340px] w-[340px] rounded-full"
            style={{ background: "rgba(216,154,42,.22)" }}
            aria-hidden="true"
          />
          <LotusMotif
            size={280}
            stroke="#ffffff"
            className="pointer-events-none absolute -left-10 -top-12 opacity-[.10]"
          />

          <div className="relative p-16 max-md:p-[34px]">
            <h2
              id="cta-heading"
              className="mb-3.5 text-[clamp(28px,4vw,44px)] font-bold text-white text-balance"
            >
              The next invoice has a good day in it. Let Sen find it.
            </h2>
            <p className="mb-7 max-w-[46ch] text-[18px] text-white/[.82]">
              Your first read takes under a minute. Free, no card — and nothing
              for your child to set up.
            </p>
            <button className="btn bg-white text-jade-deep hover:bg-paper hover:-translate-y-px">
              Get started free
            </button>
            <p
              lang="vi"
              className="mt-6 text-[16px] italic text-white/70"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              Vì mỗi đồng gửi con đều đáng giá.
            </p>
          </div>

          {/* A real student on campus — the person on the other end of every
              tuition payment. Warm, hopeful, and unmistakably the point. */}
          <div className="relative min-h-[260px] overflow-hidden md:min-h-full">
            <Image
              src="/student-sydney.png"
              alt="A Vietnamese university student smiling on campus in Sydney"
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-cover"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, var(--color-jade-deep) 0%, rgba(10,69,55,0.35) 30%, transparent 70%)",
              }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
