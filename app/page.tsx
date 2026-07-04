import { SiteNav } from "./components/SiteNav";
import { Hero } from "./components/Hero";
import { TrustStrip } from "./components/TrustStrip";
import { WhyTiming } from "./components/WhyTiming";
import { HowItWorks } from "./components/HowItWorks";
import { Features } from "./components/Features";
import { MarketBrief } from "./components/MarketBrief";
import { Testimonial } from "./components/Testimonial";
import { Faq } from "./components/Faq";
import { ClosingCta } from "./components/ClosingCta";
import { SiteFooter } from "./components/SiteFooter";

export default function Home() {
  return (
    <>
      <SiteNav />
      <main id="top">
        <Hero />
        <TrustStrip />
        <WhyTiming />
        <HowItWorks />
        <Features />
        <MarketBrief />
        <Testimonial />
        <Faq />
        <ClosingCta />
      </main>
      <SiteFooter />
    </>
  );
}
