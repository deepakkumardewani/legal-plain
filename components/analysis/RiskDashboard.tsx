"use client";

import { useState, useMemo } from "react";
import type { AnalysisResult, RiskLevel } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CategoryTabs } from "./CategoryTabs";
import { ClauseCard } from "./ClauseCard";
import { JurisdictionMismatchBanner } from "./JurisdictionMismatchBanner";

const documentTypeLabels: Record<string, string> = {
  EMPLOYMENT_CONTRACT: "Employment Contract",
  NDA: "NDA",
  RESIDENTIAL_LEASE: "Residential Lease",
};

const scoreColors: Record<string, string> = {
  high: "text-red-700",
  moderate: "text-yellow-700",
  low: "text-green-700",
};

function scoreBucket(score: number): string {
  if (score >= 70) return "high";
  if (score >= 40) return "moderate";
  return "low";
}

interface RiskDashboardProps {
  analysis: AnalysisResult;
}

export function RiskDashboard({ analysis }: RiskDashboardProps) {
  const [activeTab, setActiveTab] = useState<RiskLevel>("RED");

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
    if (dealBreakerClauses.length === 0) return;
    const el = document.getElementById(`clause-${dealBreakerClauses[0]!.id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analysis Results</h1>
            <p className="mt-1 text-sm text-gray-500">
              {documentTypeLabels[analysis.documentType] || analysis.documentType}
              {" · "}Governing law: {analysis.governingLawJurisdiction || "Not specified"}
            </p>
          </div>
          <div className="text-right">
            <p className={cn("text-3xl font-bold", scoreColors[bucket])}>
              {analysis.overallRiskScore}
            </p>
            <p className="text-sm text-gray-500">{analysis.overallRiskLabel}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <CountBadge label="Red Flags" count={analysis.redFlagCount} color="red" />
          <CountBadge label="Unusual" count={analysis.unusualCount} color="yellow" />
          <CountBadge label="Context" count={analysis.contextDependentCount} color="gray" />
          <CountBadge label="Standard" count={analysis.standardCount} color="green" />
          <CountBadge label="Missing" count={analysis.missingClauses.length} color="slate" />
        </div>
      </div>

      {analysis.jurisdictionMismatch && (
        <JurisdictionMismatchBanner mismatch={analysis.jurisdictionMismatch} />
      )}

      {dealBreakerClauses.length > 0 && (
        <div className="mt-6 rounded-lg border-2 border-red-400 bg-red-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-red-800">
              ⚠ {dealBreakerClauses.length} deal-breaker clause
              {dealBreakerClauses.length !== 1 ? "s" : ""} found — review before signing
            </p>
            <button
              type="button"
              className="shrink-0 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
              onClick={scrollToFirstDealBreaker}
            >
              Review first →
            </button>
          </div>
        </div>
      )}

      <div className="mt-6">
        <CategoryTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          redFlagCount={analysis.redFlagCount}
          unusualCount={analysis.unusualCount}
          contextDependentCount={analysis.contextDependentCount}
          standardCount={analysis.standardCount}
        />
      </div>

      <div className="mt-4 space-y-4">
        {filteredClauses.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">No clauses in this category.</p>
        ) : (
          filteredClauses.map((clause) => <ClauseCard key={clause.id} clause={clause} />)
        )}
      </div>
    </div>
  );
}

function CountBadge({ label, count, color }: { label: string; count: number; color: string }) {
  const colorMap: Record<string, string> = {
    red: "border-red-200 bg-red-50 text-red-700",
    yellow: "border-yellow-200 bg-yellow-50 text-yellow-700",
    gray: "border-gray-200 bg-gray-50 text-gray-700",
    green: "border-green-200 bg-green-50 text-green-700",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
  };

  return (
    <div className={cn("rounded-md border p-3 text-center", colorMap[color] || colorMap.gray)}>
      <p className="text-xl font-bold">{count}</p>
      <p className="text-xs">{label}</p>
    </div>
  );
}
