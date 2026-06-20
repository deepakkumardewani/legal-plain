import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/LegalPage";
import { LEGAL_LAST_UPDATED, TERMS_INTRO, TERMS_SECTIONS } from "@/components/legal/legalContent";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms governing your use of LexLight, a free plain-English legal document analysis tool. Educational information only — not legal advice.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      lastUpdated={LEGAL_LAST_UPDATED}
      intro={TERMS_INTRO}
      sections={TERMS_SECTIONS}
    />
  );
}
