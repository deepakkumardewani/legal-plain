import { describe, it, expect } from "vitest";
import { computeOverallRiskScore, overallRiskLabelForScore } from "@/lib/riskScore";
import type { ClauseAnalysis } from "@/lib/types";

const clause = (riskLevel: ClauseAnalysis["riskLevel"]): ClauseAnalysis => ({
  id: "c1",
  title: "Test",
  originalExcerpt: null,
  plainEnglish: "plain",
  riskLevel,
  riskReason: "reason",
  comparisonToStandard: "standard",
  obligation: "obligation",
});

describe("riskScore", () => {
  it("returns 0 for all GREEN clauses", () => {
    expect(computeOverallRiskScore([clause("GREEN"), clause("GREEN")])).toBe(0);
  });

  it("returns 100 for all RED clauses", () => {
    expect(computeOverallRiskScore([clause("RED"), clause("RED")])).toBe(100);
  });

  it("maps score bands to labels", () => {
    expect(overallRiskLabelForScore(75)).toBe("High Risk");
    expect(overallRiskLabelForScore(50)).toBe("Moderate Risk");
    expect(overallRiskLabelForScore(10)).toBe("Standard");
  });
});
