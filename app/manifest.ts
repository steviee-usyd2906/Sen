import type { MetadataRoute } from "next";

// Colours pulled from the Sen design tokens in app/globals.css:
//   --color-paper #faf6ed (warm ivory background) · --color-jade #0f5d49 (theme).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sen",
    short_name: "Sen",
    description:
      "Sen tells you when it looks like a good day to convert AUD to VND — so more of your money reaches the people you love in Vietnam.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf6ed",
    theme_color: "#0f5d49",
    icons: [
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
      },
    ],
  };
}
