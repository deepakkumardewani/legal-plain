import { describe, it, expect } from "vitest";
import {
  cn,
  countClausesByRiskLevel,
  reconcileAnalysisCounts,
  finalizeAnalysisResult,
  clauseNumber,
  findClauseReferences,
} from "@/lib/utils";
import type { ClauseAnalysis, AnalysisResult } from "@/lib/types";

function clause(overrides: Partial<ClauseAnalysis> = {}): ClauseAnalysis {
  return {
    id: "clause-1",
    title: "Test Clause",
    originalExcerpt: "Test text.",
    plainEnglish: "Test plain English.",
    riskLevel: "GREEN",
    riskReason: "Standard clause.",
    comparisonToStandard: "Matches standard.",
    obligation: "Test obligation.",
    negotiationTip: "Test tip.",
    affectedByMismatch: false,
    ...overrides,
  };
}

function baseAnalysis(): AnalysisResult {
  return {
    documentType: "EMPLOYMENT_CONTRACT",
    governingLawJurisdiction: null,
    partyLocations: [],
    userJurisdiction: null,
    effectiveJurisdiction: "California, USA",
    jurisdictionMismatch: null,
    overallRiskScore: 0,
    overallRiskLabel: "Low Risk",
    redFlagCount: 0,
    unusualCount: 0,
    contextDependentCount: 0,
    standardCount: 0,
    clauses: [],
    missingClauses: [],
    keyDates: [],
    yourRights: [],
    yourObligations: [],
    analyzedAt: "2026-01-01T00:00:00.000Z",
    analysisId: "550e8400-e29b-41d4-a716-446655440000",
    followUpQuestionsRemaining: 3,
  };
}

describe("cn", () => {
  it("merges tailwind classes", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("deduplicates conflicting tailwind classes", () => {
    expect(cn("px-4", "px-2")).toBe("px-2");
  });

  it("handles conditional classes", () => {
    const hidden: string | false = false;
    expect(cn("base", hidden && "hidden", "extra")).toBe("base extra");
  });

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("");
  });
});

describe("countClausesByRiskLevel", () => {
  it("returns zeros for empty array", () => {
    const counts = countClausesByRiskLevel([]);
    expect(counts).toEqual({
      redFlagCount: 0,
      unusualCount: 0,
      contextDependentCount: 0,
      standardCount: 0,
    });
  });

  it("counts all risk levels", () => {
    const clauses: ClauseAnalysis[] = [
      clause({ id: "c1", riskLevel: "RED" }),
      clause({ id: "c2", riskLevel: "RED" }),
      clause({ id: "c3", riskLevel: "YELLOW" }),
      clause({ id: "c4", riskLevel: "CONTEXT_DEPENDENT" }),
      clause({ id: "c5", riskLevel: "GREEN" }),
      clause({ id: "c6", riskLevel: "GREEN" }),
      clause({ id: "c7", riskLevel: "GREEN" }),
    ];
    const counts = countClausesByRiskLevel(clauses);
    expect(counts).toEqual({
      redFlagCount: 2,
      unusualCount: 1,
      contextDependentCount: 1,
      standardCount: 3,
    });
  });
});

describe("reconcileAnalysisCounts", () => {
  it("overwrites summary counts from clause risk levels", () => {
    const analysis = {
      ...baseAnalysis(),
      redFlagCount: 999,
      unusualCount: 888,
      clauses: [clause({ riskLevel: "RED" }), clause({ riskLevel: "GREEN" })],
    };
    const result = reconcileAnalysisCounts(analysis);
    expect(result.redFlagCount).toBe(1);
    expect(result.unusualCount).toBe(0);
  });
});

describe("finalizeAnalysisResult", () => {
  it("derives counts and risk score from clauses", () => {
    const analysis = {
      ...baseAnalysis(),
      redFlagCount: 0,
      overallRiskScore: 0,
      overallRiskLabel: "None",
      clauses: [
        clause({ id: "c1", riskLevel: "RED" }),
        clause({ id: "c2", riskLevel: "GREEN" }),
        clause({ id: "c3", riskLevel: "GREEN" }),
      ],
    };
    const result = finalizeAnalysisResult(analysis);
    expect(result.redFlagCount).toBe(1);
    expect(result.standardCount).toBe(2);
    expect(result.overallRiskScore).toBeGreaterThan(0);
    expect(result.overallRiskLabel).toBeDefined();
    expect(result.overallRiskLabel).not.toBe("None");
  });
});

describe("clauseNumber", () => {
  it("extracts number from clause ID", () => {
    expect(clauseNumber("clause-16")).toBe(16);
  });

  it("falls back to index + 1 when no number suffix", () => {
    expect(clauseNumber("unknown-format", 5)).toBe(6);
  });

  it("handles fallback index 0 by default", () => {
    expect(clauseNumber("no-number-here")).toBe(1);
  });
});

describe("findClauseReferences", () => {
  it("finds bracket-wrapped clause references", () => {
    const refs = findClauseReferences("See [clause-1] and [clause-5] for details.");
    expect(refs).toHaveLength(2);
    expect(refs[0]!.id).toBe("clause-1");
    expect(refs[1]!.id).toBe("clause-5");
  });

  it("finds paren-wrapped clause references", () => {
    const refs = findClauseReferences("Refer to (clause-2).");
    expect(refs).toHaveLength(1);
    expect(refs[0]!.id).toBe("clause-2");
  });

  it("finds bare clause references", () => {
    const refs = findClauseReferences("clause-3 applies here.");
    expect(refs).toHaveLength(1);
    expect(refs[0]!.id).toBe("clause-3");
  });

  it("returns empty for text without clause references", () => {
    const refs = findClauseReferences("No references here.");
    expect(refs).toHaveLength(0);
  });

  it("includes index and length in matches", () => {
    const refs = findClauseReferences("abc [clause-1] xyz");
    expect(refs[0]!.index).toBeGreaterThan(0);
    expect(refs[0]!.length).toBeGreaterThan(0);
  });
});
