"use client";

import { useMemo } from "react";
import type { AnalysisResult } from "@/lib/types";
import { cn, countClausesByRiskLevel } from "@/lib/utils";
import { CategoryTabs } from "./CategoryTabs";
import { ClauseCard } from "./ClauseCard";
import { JurisdictionMismatchBanner } from "./JurisdictionMismatchBanner";
import { CLAUSE_CATEGORY_TABS_ID, CLAUSE_LIST_ID, useClauseNav } from "./ClauseNavigationContext";

const documentTypeLabels: Record<string, string> = {
  EMPLOYMENT_CONTRACT: "Employment Contract",
  NDA: "NDA",
  RESIDENTIAL_LEASE: "Residential Lease",
};

const scoreColors: Record<string, string> = {
  high: "text-[#c0392b]",
  moderate: "text-[#b45309]",
  low: "text-[#2d6a4f]",
};

const PANEL_CARD =
  "rounded-2xl border border-[#e6dccd] bg-[#fffdf8] shadow-[0_20px_70px_-58px_rgba(74,55,31,0.65)]";

function scoreBucket(score: number): string {
  if (score >= 70) return "high";
  if (score >= 40) return "moderate";
  return "low";
}

interface RiskDashboardProps {
  analysis: AnalysisResult;
}

export function RiskDashboard({ analysis }: RiskDashboardProps) {
  const { activeTab, goToClause, goToTab } = useClauseNav();

  const riskCounts = useMemo(() => countClausesByRiskLevel(analysis.clauses), [analysis.clauses]);

  const filteredClauses = useMemo(() => {
    let clauses = analysis.clauses.filter((c) => c.riskLevel === activeTab);

    if (activeTab === "RED" || activeTab === "YELLOW") {
      clauses = [...clauses].sort((a, b) => {
        if (a.affectedByMismatch && !b.affectedByMismatch) return -1;
        if (!a.affectedByMismatch && b.affectedByMismatch) return 1;
        return 0;
      });
    }

    return clauses;
  }, [analysis.clauses, activeTab]);

  const bucket = scoreBucket(analysis.overallRiskScore);

  const dealBreakerClauses = useMemo(
    () => analysis.clauses.filter((c) => c.dealBreaker === true),
    [analysis.clauses],
  );

  const scrollToFirstDealBreaker = () => {
    const first = dealBreakerClauses[0];
    if (first) goToClause(first.id);
  };

  const scrollToMissingPanel = () => {
    document.getElementById("panel-missing-clauses")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="relative">
      <div className={cn("ap-rise ap-d1 space-y-6")}>
        <div className={cn(PANEL_CARD, "p-6 md:p-7")}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1
                className="text-2xl font-semibold tracking-[-0.02em] text-[#18181f] md:text-[1.65rem]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Analysis Results
              </h1>
              <p className="mt-1 text-sm text-[#5c5c66]">
                {documentTypeLabels[analysis.documentType] || analysis.documentType}
                {" · "}Governing law: {analysis.governingLawJurisdiction || "Not specified"}
              </p>
            </div>
            <div className="text-right">
              <p
                className={cn("text-4xl font-bold tabular-nums md:text-5xl", scoreColors[bucket])}
                style={{ fontFamily: "var(--font-display)" }}
              >
                {analysis.overallRiskScore}
              </p>
              <p className="text-sm font-medium text-[#5c5c66]">{analysis.overallRiskLabel}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <CountBadge
              label="Red Flags"
              count={riskCounts.redFlagCount}
              color="red"
              onClick={() => goToTab("RED")}
            />
            <CountBadge
              label="Unusual"
              count={riskCounts.unusualCount}
              color="yellow"
              onClick={() => goToTab("YELLOW")}
            />
            <CountBadge
              label="Context"
              count={riskCounts.contextDependentCount}
              color="gray"
              onClick={() => goToTab("CONTEXT_DEPENDENT")}
            />
            <CountBadge
              label="Standard"
              count={riskCounts.standardCount}
              color="green"
              onClick={() => goToTab("GREEN")}
            />
            <CountBadge
              label="Missing"
              count={analysis.missingClauses.length}
              color="slate"
              onClick={scrollToMissingPanel}
            />
          </div>
        </div>

        {analysis.jurisdictionMismatch && (
          <JurisdictionMismatchBanner mismatch={analysis.jurisdictionMismatch} />
        )}

        {dealBreakerClauses.length > 0 && (
          <div className="mt-6 rounded-xl border-2 border-[#c0392b]/35 bg-[#fdf2f0] p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-[#8b2e24]">
                {dealBreakerClauses.length} deal-breaker clause
                {dealBreakerClauses.length !== 1 ? "s" : ""} found — review before signing
              </p>
              <button
                type="button"
                className="shrink-0 rounded-lg bg-[#c0392b] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#a33228] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c0392b]/40"
                onClick={scrollToFirstDealBreaker}
              >
                Review first →
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        id={CLAUSE_CATEGORY_TABS_ID}
        className="sticky top-0 z-20 -mx-4 scroll-mt-4 bg-[#fbf8f1]/95 px-4 backdrop-blur-sm supports-[backdrop-filter]:bg-[#fbf8f1]/80 md:-mx-6 md:px-6"
      >
        <CategoryTabs
          activeTab={activeTab}
          onTabChange={goToTab}
          redFlagCount={riskCounts.redFlagCount}
          unusualCount={riskCounts.unusualCount}
          contextDependentCount={riskCounts.contextDependentCount}
          standardCount={riskCounts.standardCount}
        />
      </div>

      <div id={CLAUSE_LIST_ID} className="mt-4 scroll-mt-28 space-y-4">
        {filteredClauses.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#737373]">No clauses in this category.</p>
        ) : (
          filteredClauses.map((clause) => <ClauseCard key={clause.id} clause={clause} />)
        )}
      </div>
    </div>
  );
}

function CountBadge({
  label,
  count,
  color,
  onClick,
}: {
  label: string;
  count: number;
  color: string;
  onClick: () => void;
}) {
  const colorMap: Record<string, string> = {
    red: "border-[#e8c4c0] bg-[#fdf2f0] text-[#8b2e24] hover:border-[#d9a8a3] hover:bg-[#fce8e5]",
    yellow:
      "border-[#ecd9b8] bg-[#fef9ee] text-[#8a5a12] hover:border-[#dfc89a] hover:bg-[#fdf3e3]",
    gray: "border-[#e6dccd] bg-[#f5f0e8] text-[#5c5c66] hover:border-[#d7bf9d] hover:bg-[#f0ebe3]",
    green: "border-[#c5ddd0] bg-[#edf7f2] text-[#1f5c40] hover:border-[#a8cfc0] hover:bg-[#e3f2eb]",
    slate: "border-[#ddd5c8] bg-[#f5f0e8] text-[#4a4a52] hover:border-[#cfc4b4] hover:bg-[#efe9e1]",
  };

  return (
    <button
      type="button"
      className={cn(
        "rounded-xl border p-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8791a]/40",
        colorMap[color] || colorMap.gray,
      )}
      onClick={onClick}
      aria-label={`View ${label}: ${count}`}
    >
      <p className="text-xl font-bold tabular-nums" style={{ fontFamily: "var(--font-display)" }}>
        {count}
      </p>
      <p className="text-xs font-medium">{label}</p>
    </button>
  );
}
