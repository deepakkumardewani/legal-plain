import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/LegalPage";
import {
  LEGAL_LAST_UPDATED,
  PRIVACY_INTRO,
  PRIVACY_SECTIONS,
} from "@/components/legal/legalContent";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How LexLight handles your documents: no account required, encrypted in transit, never stored, never used for AI training, with PII redacted before analysis.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated={LEGAL_LAST_UPDATED}
      intro={PRIVACY_INTRO}
      sections={PRIVACY_SECTIONS}
    />
  );
}
