"use client";

import { useSyncExternalStore } from "react";
import {
  getStoredAnalysis,
  getStoredDocumentText,
  setStoredAnalysis,
  clearStoredAnalysis,
  subscribeToAnalysis,
} from "@/lib/analysisStore";
import type { AnalysisResult } from "@/lib/types";

export function useAnalysisStore(): {
  analysis: AnalysisResult | null;
  documentText: string | null;
  setAnalysis: (a: AnalysisResult, text?: string) => void;
  clearAnalysis: () => void;
} {
  const analysis = useSyncExternalStore(subscribeToAnalysis, getStoredAnalysis, getStoredAnalysis);

  return {
    analysis,
    documentText: getStoredDocumentText(),
    setAnalysis: setStoredAnalysis,
    clearAnalysis: clearStoredAnalysis,
  };
}
