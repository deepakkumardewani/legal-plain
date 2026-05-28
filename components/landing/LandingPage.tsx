import { fontVariables } from "@/lib/fonts";
import { LandingCtaSection } from "@/components/landing/LandingCtaSection";
import { LandingFaqSection } from "@/components/landing/LandingFaqSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingHero } from "@/components/landing/LandingHero";
import { PrivacySection } from "@/components/landing/PrivacySection";
import { ReportOutcomesSection } from "@/components/landing/ReportOutcomesSection";
import { ReviewMethodSection } from "@/components/landing/ReviewMethodSection";
import { SupportedDocumentsSection } from "@/components/landing/SupportedDocumentsSection";
import { TrustStrip } from "@/components/landing/TrustStrip";

export function LandingPage() {
  return (
    <div
      className={`${fontVariables} bg-[#fbf8f1] text-[#171612]`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      <LandingHeader />
      <LandingHero />
      <TrustStrip />
      <SupportedDocumentsSection />
      <ReviewMethodSection />
      <ReportOutcomesSection />
      <PrivacySection />
      <LandingFaqSection />
      <LandingCtaSection />
      <LandingFooter />
    </div>
  );
}
