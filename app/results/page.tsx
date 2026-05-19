"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAnalysisStore } from "@/lib/useAnalysisStore";
import { RiskDashboard } from "@/components/analysis/RiskDashboard";

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
      <RiskDashboard analysis={analysis} />
    </main>
  );
}
