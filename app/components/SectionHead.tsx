import type { ReactNode } from "react";

/** Shared eyebrow + h2 + optional lead block used across sections. */
export function SectionHead({
  eyebrow,
  title,
  headingId,
  centered = false,
  children,
}: {
  eyebrow: string;
  title: string;
  headingId: string;
  centered?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      className={`mb-2 max-w-[60ch] ${centered ? "mx-auto text-center" : ""}`}
    >
      <span className="eyebrow">{eyebrow}</span>
      <h2
        id={headingId}
        className="my-3 text-[clamp(28px,3.6vw,40px)] font-bold"
      >
        {title}
      </h2>
      {children ? <p className="text-[18px] text-muted">{children}</p> : null}
    </div>
  );
}
