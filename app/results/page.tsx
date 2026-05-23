"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAnalysisStore } from "@/lib/useAnalysisStore";
import { RiskDashboard } from "@/components/analysis/RiskDashboard";
import { MissingClausesPanel } from "@/components/analysis/MissingClausesPanel";
import { KeyDatesPanel } from "@/components/analysis/KeyDatesPanel";
import { YourRightsPanel } from "@/components/analysis/YourRightsPanel";
import { ObligationsPanel } from "@/components/analysis/ObligationsPanel";
import { FollowUpInput } from "@/components/analysis/FollowUpInput";

export default function ResultsPage() {
  const router = useRouter();
  const { analysis, documentText } = useAnalysisStore();

  useEffect(() => {
    if (!analysis) {
      router.replace("/analyze");
    }
  }, [analysis, router]);

  if (!analysis) {
    return null;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <RiskDashboard analysis={analysis} />

      <div className="mt-8 space-y-6">
        <MissingClausesPanel clauses={analysis.missingClauses} />
        <KeyDatesPanel dates={analysis.keyDates} />
        <YourRightsPanel rights={analysis.yourRights} />
        <ObligationsPanel obligations={analysis.yourObligations} />
      </div>

      <FollowUpInput analysis={analysis} documentText={documentText || ""} />
    </main>
  );
}
