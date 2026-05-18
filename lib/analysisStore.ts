import type { AnalysisResult } from "@/lib/types";

type Listener = () => void;

let _analysis: AnalysisResult | null = null;
const listeners = new Set<Listener>();

export function getStoredAnalysis(): AnalysisResult | null {
  return _analysis;
}

export function setStoredAnalysis(analysis: AnalysisResult): void {
  _analysis = analysis;
  listeners.forEach((fn) => fn());
}

export function clearStoredAnalysis(): void {
  _analysis = null;
  listeners.forEach((fn) => fn());
}

export function subscribeToAnalysis(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
