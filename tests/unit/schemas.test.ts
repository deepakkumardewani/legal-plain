import { describe, it, expect } from "vitest";
import {
  analyzeRequestSchema,
  followupRequestSchema,
  shareRequestSchema,
  pass1ResultSchema,
  analysisResultSchema,
} from "@/lib/schemas";

const validUuid = "550e8400-e29b-41d4-a716-446655440000";

function validAnalysisResult() {
  return {
    documentType: "EMPLOYMENT_CONTRACT" as const,
    governingLawJurisdiction: "New York, USA",
    partyLocations: ["California, USA"],
    userJurisdiction: null,
    effectiveJurisdiction: "New York, USA",
    jurisdictionMismatch: null,
    overallRiskScore: 75,
    overallRiskLabel: "Moderate Risk",
    redFlagCount: 3,
    unusualCount: 4,
    contextDependentCount: 2,
    standardCount: 14,
    clauses: [
      {
        id: "clause-1",
        title: "Non-Compete",
        originalExcerpt: "Employee shall not compete...",
        plainEnglish: "You cannot work for competitors for 2 years.",
        riskLevel: "RED" as const,
        riskReason: "Overly broad geographic scope.",
        comparisonToStandard: "Broader than typical in New York.",
        obligation: "Cannot join competitors for 24 months.",
        negotiationTip: "Ask to limit to 12 months and specific role.",
        affectedByMismatch: true,
      },
    ],
    missingClauses: [
      {
        title: "Severance Clause",
        whyItMatters: "No guaranteed payment if terminated.",
        whatToAskFor: "2 weeks per year of service.",
      },
    ],
    keyDates: [
      {
        label: "Notice Period",
        value: "30 days written notice",
        urgency: "HIGH" as const,
      },
    ],
    yourRights: ["Right to terminate with 30 days notice"],
    yourObligations: ["Maintain confidentiality"],
    analyzedAt: "2026-05-18T12:00:00.000Z",
    analysisId: validUuid,
    followUpQuestionsRemaining: 3,
  };
}

describe("analyzeRequestSchema", () => {
  it("accepts a valid analyze request", () => {
    const result = analyzeRequestSchema.safeParse({
      documentText: "Employment agreement...",
      documentType: "EMPLOYMENT_CONTRACT",
      userId: validUuid,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing documentType", () => {
    const result = analyzeRequestSchema.safeParse({
      documentText: "Employment agreement...",
      userId: validUuid,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty document text", () => {
    const result = analyzeRequestSchema.safeParse({
      documentText: "",
      documentType: "EMPLOYMENT_CONTRACT",
      userId: validUuid,
    });
    expect(result.success).toBe(false);
  });

  it("rejects document over 150k chars", () => {
    const result = analyzeRequestSchema.safeParse({
      documentText: "x".repeat(150001),
      documentType: "EMPLOYMENT_CONTRACT",
      userId: validUuid,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid userId", () => {
    const result = analyzeRequestSchema.safeParse({
      documentText: "Employment agreement...",
      documentType: "EMPLOYMENT_CONTRACT",
      userId: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });
});

describe("followupRequestSchema", () => {
  it("accepts a valid followup request", () => {
    const result = followupRequestSchema.safeParse({
      question: "What does clause 5 mean?",
      analysisResult: validAnalysisResult(),
      documentText: "Full document text...",
      userId: validUuid,
      analysisId: validUuid,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty question", () => {
    const result = followupRequestSchema.safeParse({
      question: "",
      analysisResult: validAnalysisResult(),
      documentText: "Full document text...",
      userId: validUuid,
      analysisId: validUuid,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid userId on followup", () => {
    const result = followupRequestSchema.safeParse({
      question: "What does clause 5 mean?",
      analysisResult: validAnalysisResult(),
      documentText: "Full document text...",
      userId: "bad-uuid",
      analysisId: validUuid,
    });
    expect(result.success).toBe(false);
  });

  it("rejects documentText exceeding 150,000 characters", () => {
    const result = followupRequestSchema.safeParse({
      question: "What does clause 5 mean?",
      analysisResult: validAnalysisResult(),
      documentText: "a".repeat(150001),
      userId: validUuid,
      analysisId: validUuid,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues[0].message;
      expect(msg).toContain("150,000");
    }
  });

  it("accepts documentText at exactly 150,000 characters", () => {
    const result = followupRequestSchema.safeParse({
      question: "What does clause 5 mean?",
      analysisResult: validAnalysisResult(),
      documentText: "a".repeat(150000),
      userId: validUuid,
      analysisId: validUuid,
    });
    expect(result.success).toBe(true);
  });
});

describe("shareRequestSchema", () => {
  it("accepts a valid share request", () => {
    const result = shareRequestSchema.safeParse({
      analysisResult: validAnalysisResult(),
      userId: validUuid,
    });
    expect(result.success).toBe(true);
  });
});

describe("pass1ResultSchema", () => {
  it("accepts a valid Pass 1 result with mismatch", () => {
    const result = pass1ResultSchema.safeParse({
      valid: true,
      documentType: "EMPLOYMENT_CONTRACT",
      governingLawJurisdiction: "New York, USA",
      partyLocations: ["California, USA"],
      jurisdictionMismatch: true,
      mismatchConfidence: "HIGH",
      clauseMap: ["Section 1: Employment Terms", "Section 2: Non-Compete"],
    });
    expect(result.success).toBe(true);
  });

  it("accepts an invalid document result", () => {
    const result = pass1ResultSchema.safeParse({
      valid: false,
      reason: "Not a legal document",
      documentType: "EMPLOYMENT_CONTRACT",
      governingLawJurisdiction: null,
      partyLocations: [],
      jurisdictionMismatch: false,
      mismatchConfidence: null,
      clauseMap: [],
    });
    expect(result.success).toBe(true);
  });
});

describe("analysisResultSchema", () => {
  it("accepts a valid full analysis result", () => {
    const result = analysisResultSchema.safeParse(validAnalysisResult());
    expect(result.success).toBe(true);
  });

  it("rejects overallRiskScore out of range", () => {
    const data = { ...validAnalysisResult(), overallRiskScore: 101 };
    const result = analysisResultSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects negative overallRiskScore", () => {
    const data = { ...validAnalysisResult(), overallRiskScore: -1 };
    const result = analysisResultSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects invalid documentType", () => {
    const data = { ...validAnalysisResult(), documentType: "PURCHASE_AGREEMENT" };
    const result = analysisResultSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects missing required field", () => {
    const { overallRiskScore: _overallRiskScore, ...data } = validAnalysisResult();
    const result = analysisResultSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects non-integer redFlagCount", () => {
    const data = { ...validAnalysisResult(), redFlagCount: 1.5 };
    const result = analysisResultSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
