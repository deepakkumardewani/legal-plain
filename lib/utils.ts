import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AnalysisResult, ClauseAnalysis } from "@/lib/types";
import { computeOverallRiskScore, overallRiskLabelForScore } from "@/lib/riskScore";

export interface ClauseRiskCounts {
  redFlagCount: number;
  unusualCount: number;
  contextDependentCount: number;
  standardCount: number;
}

/** Counts from actual clause risk levels — single source of truth for tabs and summary chips. */
export function countClausesByRiskLevel(clauses: ClauseAnalysis[]): ClauseRiskCounts {
  const counts: ClauseRiskCounts = {
    redFlagCount: 0,
    unusualCount: 0,
    contextDependentCount: 0,
    standardCount: 0,
  };

  for (const clause of clauses) {
    switch (clause.riskLevel) {
      case "RED":
        counts.redFlagCount++;
        break;
      case "YELLOW":
        counts.unusualCount++;
        break;
      case "CONTEXT_DEPENDENT":
        counts.contextDependentCount++;
        break;
      case "GREEN":
        counts.standardCount++;
        break;
    }
  }

  return counts;
}

/** Overwrite summary counts when the model's totals disagree with clause risk levels. */
export function reconcileAnalysisCounts(analysis: AnalysisResult): AnalysisResult {
  return { ...analysis, ...countClausesByRiskLevel(analysis.clauses) };
}

/** Derive counts and risk score from clauses (deterministic; used after AI + on cache read). */
export function finalizeAnalysisResult(analysis: AnalysisResult): AnalysisResult {
  const counts = countClausesByRiskLevel(analysis.clauses);
  const overallRiskScore = computeOverallRiskScore(analysis.clauses);
  return {
    ...analysis,
    ...counts,
    overallRiskScore,
    overallRiskLabel: overallRiskLabelForScore(overallRiskScore),
  };
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Numeric suffix from ids like `clause-16`; falls back to list index + 1. */
export function clauseNumber(id: string, fallbackIndex = 0): number {
  const match = id.match(/-(\d+)$/);
  if (match) return Number(match[1]);
  return fallbackIndex + 1;
}

export interface ClauseReferenceMatch {
  id: string;
  index: number;
  length: number;
}

/** Matches clause IDs in bracket, parenthesis, or bare form — e.g. [clause-1], (clause-6), clause-5. */
const CLAUSE_REF_PATTERN = /(?:\[|\()?(clause-[a-zA-Z0-9-]+)(?:\]|\))?/g;

export function findClauseReferences(text: string): ClauseReferenceMatch[] {
  const matches: ClauseReferenceMatch[] = [];
  const regex = new RegExp(CLAUSE_REF_PATTERN.source, "g");
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    matches.push({
      id: match[1]!,
      index: match.index,
      length: match[0].length,
    });
  }
  return matches;
}
