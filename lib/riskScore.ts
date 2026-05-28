import type { ClauseAnalysis } from "@/lib/types";

const RISK_WEIGHT: Record<ClauseAnalysis["riskLevel"], number> = {
  RED: 25,
  YELLOW: 12,
  CONTEXT_DEPENDENT: 6,
  GREEN: 0,
};

/** Deterministic 0–100 score from clause risk levels (matches Pass-2 rubric). */
export function computeOverallRiskScore(clauses: ClauseAnalysis[]): number {
  if (clauses.length === 0) return 50;

  const sum = clauses.reduce((acc, clause) => acc + RISK_WEIGHT[clause.riskLevel], 0);
  const max = clauses.length * RISK_WEIGHT.RED;
  return Math.round(Math.min(100, Math.max(0, (sum / max) * 100)));
}

export function overallRiskLabelForScore(score: number): string {
  if (score >= 70) return "High Risk";
  if (score >= 40) return "Moderate Risk";
  if (score >= 20) return "Low Risk";
  return "Standard";
}
