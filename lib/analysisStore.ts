import type { AnalysisResult } from "@/lib/types";

type Listener = () => void;

let _analysis: AnalysisResult | null = null;
let _documentText: string | null = null;
const listeners = new Set<Listener>();

export function getStoredAnalysis(): AnalysisResult | null {
  if (!_analysis) return null;
  if (_analysis.analysisId) return _analysis;
  _analysis = { ..._analysis, analysisId: crypto.randomUUID() };
  listeners.forEach((fn) => fn());
  return _analysis;
}

export function getStoredDocumentText(): string | null {
  return _documentText;
}

export function setStoredAnalysis(analysis: AnalysisResult, documentText?: string): void {
  _analysis = {
    ...analysis,
    analysisId: analysis.analysisId || crypto.randomUUID(),
  };
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
