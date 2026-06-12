import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAnalysisStore } from "@/lib/useAnalysisStore";
import { clearStoredAnalysis } from "@/lib/analysisStore";
import type { AnalysisResult } from "@/lib/types";

function makeAnalysis(): AnalysisResult {
  return {
    documentType: "EMPLOYMENT_CONTRACT",
    governingLawJurisdiction: null,
    partyLocations: [],
    userJurisdiction: null,
    effectiveJurisdiction: "California, USA",
    jurisdictionMismatch: null,
    overallRiskScore: 10,
    overallRiskLabel: "Low Risk",
    redFlagCount: 0,
    unusualCount: 0,
    contextDependentCount: 0,
    standardCount: 1,
    clauses: [
      {
        id: "clause-1",
        title: "Test",
        originalExcerpt: "Test.",
        plainEnglish: "Test.",
        riskLevel: "GREEN",
        riskReason: "OK.",
        comparisonToStandard: "OK.",
        obligation: "OK.",
        negotiationTip: "None.",
        affectedByMismatch: false,
      },
    ],
    missingClauses: [],
    keyDates: [],
    yourRights: [],
    yourObligations: [],
    analyzedAt: "2026-01-01T00:00:00.000Z",
    analysisId: "550e8400-e29b-41d4-a716-446655440000",
    followUpQuestionsRemaining: 3,
  };
}

describe("useAnalysisStore", () => {
  beforeEach(() => {
    clearStoredAnalysis();
  });

  it("returns null analysis initially", () => {
    const { result } = renderHook(() => useAnalysisStore());
    expect(result.current.analysis).toBeNull();
    expect(result.current.documentText).toBeNull();
  });

  it("setAnalysis stores and returns analysis", () => {
    const { result } = renderHook(() => useAnalysisStore());
    const analysis = makeAnalysis();
    act(() => {
      result.current.setAnalysis(analysis);
    });
    expect(result.current.analysis?.analysisId).toBe(analysis.analysisId);
  });

  it("clearAnalysis clears stored analysis", () => {
    const { result } = renderHook(() => useAnalysisStore());
    act(() => {
      result.current.setAnalysis(makeAnalysis());
    });
    act(() => {
      result.current.clearAnalysis();
    });
    expect(result.current.analysis).toBeNull();
  });

  it("setAnalysis stores document text", () => {
    const { result } = renderHook(() => useAnalysisStore());
    act(() => {
      result.current.setAnalysis(makeAnalysis(), "Document content");
    });
    expect(result.current.documentText).toBe("Document content");
  });

  it("documentText is null when not provided", () => {
    const { result } = renderHook(() => useAnalysisStore());
    act(() => {
      result.current.setAnalysis(makeAnalysis());
    });
    expect(result.current.documentText).toBeNull();
  });
});
