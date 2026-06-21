import { fontVariables } from "@/lib/fonts";
import { AdvancedFeaturesSection } from "@/components/landing/AdvancedFeaturesSection";
import { LandingCtaSection } from "@/components/landing/LandingCtaSection";
import { LandingFaqSection } from "@/components/landing/LandingFaqSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingHero } from "@/components/landing/LandingHero";
import { PrivacySection } from "@/components/landing/PrivacySection";
import { Reveal } from "@/components/landing/Reveal";
import { ReportOutcomesSection } from "@/components/landing/ReportOutcomesSection";
import { ReviewMethodSection } from "@/components/landing/ReviewMethodSection";
import { SupportedDocumentsSection } from "@/components/landing/SupportedDocumentsSection";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { WhyAiReviewSection } from "@/components/landing/WhyAiReviewSection";

export function LandingPage() {
  return (
    <div
      className={`${fontVariables} bg-background text-foreground`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      <LandingHeader />
      <LandingHero />
      <Reveal>
        <TrustStrip />
      </Reveal>
      <Reveal>
        <SupportedDocumentsSection />
      </Reveal>
      <Reveal>
        <WhyAiReviewSection />
      </Reveal>
      <Reveal>
        <ReviewMethodSection />
      </Reveal>
      <Reveal>
        <ReportOutcomesSection />
      </Reveal>
      <Reveal>
        <AdvancedFeaturesSection />
      </Reveal>
      <Reveal>
        <PrivacySection />
      </Reveal>
      <Reveal>
        <LandingFaqSection />
      </Reveal>
      <Reveal>
        <LandingCtaSection />
      </Reveal>
      <LandingFooter />
    </div>
  );
}
