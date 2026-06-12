import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getStoredAnalysis,
  getStoredDocumentText,
  setStoredAnalysis,
  clearStoredAnalysis,
  subscribeToAnalysis,
} from "@/lib/analysisStore";
import type { AnalysisResult } from "@/lib/types";

function makeAnalysis(overrides: Partial<AnalysisResult> = {}): AnalysisResult {
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
    ...overrides,
  };
}

describe("analysisStore", () => {
  beforeEach(() => {
    clearStoredAnalysis();
  });

  it("getStoredAnalysis returns null when empty", () => {
    expect(getStoredAnalysis()).toBeNull();
  });

  it("getStoredDocumentText returns null when empty", () => {
    expect(getStoredDocumentText()).toBeNull();
  });

  it("setStoredAnalysis stores analysis", () => {
    const analysis = makeAnalysis();
    setStoredAnalysis(analysis);
    expect(getStoredAnalysis()?.analysisId).toBe(analysis.analysisId);
  });

  it("setStoredAnalysis stores document text", () => {
    const analysis = makeAnalysis();
    setStoredAnalysis(analysis, "Some document text");
    expect(getStoredDocumentText()).toBe("Some document text");
  });

  it("clearStoredAnalysis clears both", () => {
    setStoredAnalysis(makeAnalysis(), "doc text");
    clearStoredAnalysis();
    expect(getStoredAnalysis()).toBeNull();
    expect(getStoredDocumentText()).toBeNull();
  });

  it("generate analysisId when missing", () => {
    const analysis = makeAnalysis({ analysisId: "" } as unknown as AnalysisResult);
    setStoredAnalysis(analysis);
    const stored = getStoredAnalysis();
    expect(stored?.analysisId).toBeTruthy();
    // Should be a valid UUID
    expect(stored?.analysisId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it("subscriber is called on setStoredAnalysis", () => {
    const listener = vi.fn();
    subscribeToAnalysis(listener);
    setStoredAnalysis(makeAnalysis());
    expect(listener).toHaveBeenCalled();
  });

  it("subscriber is called on clearStoredAnalysis", () => {
    setStoredAnalysis(makeAnalysis());
    const listener = vi.fn();
    subscribeToAnalysis(listener);
    clearStoredAnalysis();
    expect(listener).toHaveBeenCalled();
  });

  it("unsubscribe stops listener from being called", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToAnalysis(listener);
    unsubscribe();
    setStoredAnalysis(makeAnalysis());
    expect(listener).not.toHaveBeenCalled();
  });

  it("getStoredAnalysis generates analysisId when stored without one", () => {
    // Simulate analysis stored without analysisId
    const analysis = makeAnalysis({ analysisId: "" } as unknown as AnalysisResult);
    setStoredAnalysis(analysis);
    // getStoredAnalysis should detect missing analysisId and generate one
    const result = getStoredAnalysis();
    expect(result?.analysisId).toBeTruthy();
    expect(result?.analysisId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it("multiple subscribers are all called", () => {
    const a = vi.fn();
    const b = vi.fn();
    subscribeToAnalysis(a);
    subscribeToAnalysis(b);
    setStoredAnalysis(makeAnalysis());
    expect(a).toHaveBeenCalled();
    expect(b).toHaveBeenCalled();
  });
});
