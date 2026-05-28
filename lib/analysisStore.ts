import type { AnalysisResult } from "@/lib/types";
import { countClausesByRiskLevel, reconcileAnalysisCounts } from "@/lib/utils";

type Listener = () => void;

let _analysis: AnalysisResult | null = null;
let _documentText: string | null = null;
const listeners = new Set<Listener>();

function syncStoredCounts(): void {
  if (!_analysis) return;
  const counts = countClausesByRiskLevel(_analysis.clauses);
  if (
    _analysis.redFlagCount === counts.redFlagCount &&
    _analysis.unusualCount === counts.unusualCount &&
    _analysis.contextDependentCount === counts.contextDependentCount &&
    _analysis.standardCount === counts.standardCount
  ) {
    return;
  }
  _analysis = { ..._analysis, ...counts };
}

export function getStoredAnalysis(): AnalysisResult | null {
  if (!_analysis) return null;
  if (!_analysis.analysisId) {
    _analysis = reconcileAnalysisCounts({
      ..._analysis,
      analysisId: crypto.randomUUID(),
    });
    listeners.forEach((fn) => fn());
    return _analysis;
  }
  syncStoredCounts();
  return _analysis;
}

export function getStoredDocumentText(): string | null {
  return _documentText;
}

export function setStoredAnalysis(analysis: AnalysisResult, documentText?: string): void {
  _analysis = reconcileAnalysisCounts({
    ...analysis,
    analysisId: analysis.analysisId || crypto.randomUUID(),
  });
  if (documentText !== undefined) {
    _documentText = documentText;
  }
  listeners.forEach((fn) => fn());
}

export function clearStoredAnalysis(): void {
  _analysis = null;
  _documentText = null;
  listeners.forEach((fn) => fn());
}

export function subscribeToAnalysis(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
