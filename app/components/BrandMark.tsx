// The lotus ("sen") mark, reused in the nav and footer.
export function BrandMark({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 30"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M15 26c-4-2-9-5-9-11 3 0 6 1.5 9 6 3-4.5 6-6 9-6 0 6-5 9-9 11Z"
        fill="#1C8A68"
      />
      <path d="M15 24c0-6 0-11 0-16-3 3-5 7-5 11 0 2 2 4 5 5Z" fill="#0F5D49" />
      <path d="M15 24c0-6 0-11 0-16 3 3 5 7 5 11 0 2-2 4-5 5Z" fill="#147A5E" />
      <circle cx="15" cy="6" r="2.4" fill="#D89A2A" />
    </svg>
  );
}
