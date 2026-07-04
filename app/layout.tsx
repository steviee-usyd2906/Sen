import type { Metadata } from "next";
import { Playfair_Display, Be_Vietnam_Pro, Lora } from "next/font/google";
import "./globals.css";

// Locked brand stack: Playfair Display for display/headlines, Be Vietnam Pro
// for body (designed for Vietnamese — diacritics render cleanly), Lora as the
// secondary/accent serif for bilingual taglines and editorial touches.
const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-playfair",
  display: "swap",
});

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-be-vietnam",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin", "vietnamese"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

// Site URL from env, with a localhost fallback for local dev.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const TITLE =
  "Sen — pay your child's tuition in Australia at the right time";
const DESCRIPTION =
  "For families between Việt Nam and Australia: the AUD–VND rate changes every day, and on a semester's fees a good day is worth millions of đồng. Sen watches the rate and tells you when to pay tuition, rent, or send money home. Sen doesn't move money — you pay through your own bank or your university's portal.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: SITE_URL,
    siteName: "Sen",
    locale: "en_AU",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${beVietnam.variable} ${lora.variable}`}>
        {children}
      </body>
    </html>
  );
}
