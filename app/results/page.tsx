"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAnalysisStore } from "@/lib/useAnalysisStore";

export default function ResultsPage() {
  const router = useRouter();
  const { analysis } = useAnalysisStore();

  useEffect(() => {
    if (!analysis) {
      router.replace("/");
    }
  }, [analysis, router]);

  if (!analysis) {
    return null;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analysis Results</h1>
        <p className="mt-1 text-gray-500">
          {analysis.documentType} · Governing law:{" "}
          {analysis.effectiveJurisdiction || "Not specified"}
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-lg font-medium text-gray-900">
          Overall Risk Score: {analysis.overallRiskScore}
        </p>
        <p className="mt-1 text-gray-500">{analysis.overallRiskLabel}</p>
        <p className="mt-4 text-sm text-gray-400">Full results dashboard coming in Phase 3</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-center">
          <p className="text-xl font-bold text-red-700">{analysis.redFlagCount}</p>
          <p className="text-xs text-red-600">Red Flags</p>
        </div>
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-center">
          <p className="text-xl font-bold text-yellow-700">{analysis.unusualCount}</p>
          <p className="text-xs text-yellow-600">Unusual</p>
        </div>
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-center">
          <p className="text-xl font-bold text-gray-700">{analysis.contextDependentCount}</p>
          <p className="text-xs text-gray-600">Context-Dependent</p>
        </div>
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-center">
          <p className="text-xl font-bold text-green-700">{analysis.standardCount}</p>
          <p className="text-xs text-green-600">Standard</p>
        </div>
      </div>
    </main>
  );
}
