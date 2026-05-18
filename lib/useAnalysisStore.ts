"use client";

import { useSyncExternalStore } from "react";
import {
  getStoredAnalysis,
  setStoredAnalysis,
  clearStoredAnalysis,
  subscribeToAnalysis,
} from "@/lib/analysisStore";
import type { AnalysisResult } from "@/lib/types";

export function useAnalysisStore(): {
  analysis: AnalysisResult | null;
  setAnalysis: (a: AnalysisResult) => void;
  clearAnalysis: () => void;
} {
  const analysis = useSyncExternalStore(subscribeToAnalysis, getStoredAnalysis, getStoredAnalysis);

  return {
    analysis,
    setAnalysis: setStoredAnalysis,
    clearAnalysis: clearStoredAnalysis,
  };
}
