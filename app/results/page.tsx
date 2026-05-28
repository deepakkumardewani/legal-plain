"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAnalysisStore } from "@/lib/useAnalysisStore";
import { fontVariables } from "@/lib/fonts";
import { RiskDashboard } from "@/components/analysis/RiskDashboard";
import { StatutoryProtectionsPanel } from "@/components/analysis/StatutoryProtectionsPanel";
import { MissingClausesPanel } from "@/components/analysis/MissingClausesPanel";
import { ContradictionsPanel } from "@/components/analysis/ContradictionsPanel";
import { KeyDatesPanel } from "@/components/analysis/KeyDatesPanel";
import { YourRightsPanel } from "@/components/analysis/YourRightsPanel";
import { ObligationsPanel } from "@/components/analysis/ObligationsPanel";
import { FollowUpInput } from "@/components/analysis/FollowUpInput";
import { ClauseNavigationProvider } from "@/components/analysis/ClauseNavigationContext";

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
    <ClauseNavigationProvider clauses={analysis.clauses}>
      <div
        className={`${fontVariables} min-h-screen bg-[#fbf8f1] text-[#18181f]`}
        style={{ fontFamily: "var(--font-body)" }}
      >
        <main className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-12">
          <RiskDashboard analysis={analysis} />

          <div className="ap-rise ap-d2 mt-8 space-y-6">
            <StatutoryProtectionsPanel protections={analysis.statutoryProtections} />
            <MissingClausesPanel clauses={analysis.missingClauses} />
            <ContradictionsPanel contradictions={analysis.contradictions} />
          </div>

          <div className="ap-rise ap-d3 mt-6 space-y-6">
            <KeyDatesPanel dates={analysis.keyDates} />
            <YourRightsPanel rights={analysis.yourRights} />
            <ObligationsPanel obligations={analysis.yourObligations} />
          </div>

          <div className="ap-rise ap-d4 mt-8">
            <FollowUpInput analysis={analysis} documentText={documentText || ""} />
          </div>
        </main>
      </div>
    </ClauseNavigationProvider>
  );
}
