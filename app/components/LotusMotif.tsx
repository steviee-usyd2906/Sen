// A large, delicate line-art lotus — the brand's namesake, drawn as an
// open five-petal fan. Purely decorative: always aria-hidden, always at
// low opacity behind content. Stroke colour is passed per surface
// (jade on paper, gold on the dark panel, white on the jade CTA).
export function LotusMotif({
  size = 260,
  stroke = "var(--color-jade)",
  className = "",
}: {
  size?: number;
  stroke?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size * 0.72}
      viewBox="0 0 200 144"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <g stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {/* centre petal */}
        <path d="M100 132 C86 106 86 66 100 34 C114 66 114 106 100 132 Z" />
        {/* inner pair */}
        <path d="M100 132 C78 118 66 92 66 58 C88 72 100 98 100 126" />
        <path d="M100 132 C122 118 134 92 134 58 C112 72 100 98 100 126" />
        {/* outer pair */}
        <path d="M100 132 C70 128 44 110 34 82 C64 86 90 106 99 128" />
        <path d="M100 132 C130 128 156 110 166 82 C136 86 110 106 101 128" />
        {/* water line beneath the bloom */}
        <path d="M58 140 C74 136 90 136 100 140 C110 136 126 136 142 140" opacity=".7" />
      </g>
    </svg>
  );
}
