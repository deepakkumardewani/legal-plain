import type { Pass1Result, AnalysisResult } from "@/lib/types";

export const validPass1Result: Pass1Result = {
  valid: true,
  documentType: "EMPLOYMENT_CONTRACT",
  governingLawJurisdiction: "New York, USA",
  partyLocations: ["California, USA"],
  jurisdictionMismatch: true,
  mismatchConfidence: "HIGH",
  clauseMap: ["Section 1: Employment Terms", "Section 2: Non-Compete"],
};

export const pass1NoMismatch: Pass1Result = {
  valid: true,
  documentType: "NDA",
  governingLawJurisdiction: "California, USA",
  partyLocations: ["California, USA"],
  jurisdictionMismatch: false,
  mismatchConfidence: null,
  clauseMap: ["Section 1: Definition", "Section 2: Obligations"],
};

export const pass1Rejected: Pass1Result = {
  valid: false,
  reason: "This appears to be a purchase agreement, which is not currently supported.",
  documentType: "EMPLOYMENT_CONTRACT",
  governingLawJurisdiction: null,
  partyLocations: [],
  jurisdictionMismatch: false,
  mismatchConfidence: null,
  clauseMap: [],
};

export const sampleAnalysis: AnalysisResult = {
  documentType: "EMPLOYMENT_CONTRACT",
  governingLawJurisdiction: "New York, USA",
  partyLocations: ["California, USA"],
  userJurisdiction: null,
  effectiveJurisdiction: "New York, USA",
  jurisdictionMismatch: {
    governingLaw: "New York, USA",
    partyLocations: ["California, USA"],
    confidence: "HIGH",
    riskLevel: "HIGH",
    plainEnglish:
      "Your contract is governed by New York law, but you appear to be based in California. This matters because...",
    whyItMatters:
      "Employment laws differ significantly between New York and California — non-compete enforceability, wage and hour requirements, and mandatory benefits all vary.",
    affectedClauseIds: ["clause-1"],
    whatToAskFor:
      "Ask the employer to change the governing law clause to California, or confirm in writing that CA law will apply.",
  },
  overallRiskScore: 75,
  overallRiskLabel: "Moderate Risk",
  redFlagCount: 2,
  unusualCount: 3,
  contextDependentCount: 1,
  standardCount: 5,
  clauses: [
    {
      id: "clause-1",
      title: "Non-Compete Clause",
      originalExcerpt:
        "Employee agrees not to compete with Employer anywhere in the United States for a period of 24 months following termination.",
      plainEnglish:
        "You cannot work for any competitor in the entire US for 2 years after leaving.",
      riskLevel: "RED",
      riskReason:
        "Geographic scope (entire US) is excessively broad. Under California law, this clause would likely be void.",
      comparisonToStandard:
        "Standard non-competes are limited to specific geographic regions and 6-12 months in New York.",
      obligation: "Cannot work for competitors in the US for 2 years after termination.",
      negotiationTip:
        "Ask to limit to specific competitors or geographic region, and reduce duration to 12 months.",
      affectedByMismatch: true,
    },
    {
      id: "clause-2",
      title: "IP Assignment",
      originalExcerpt:
        "Employee hereby assigns all inventions, whether or not developed during work hours or using company equipment.",
      plainEnglish:
        "Everything you create belongs to the company, even things you make on your own time with your own equipment.",
      riskLevel: "RED",
      riskReason:
        "Overbroad IP assignment that captures non-work inventions, which is not standard.",
      comparisonToStandard:
        "Standard IP clauses are limited to work-related inventions developed using company resources.",
      obligation: "Must assign all inventions to the employer, even personal projects.",
      negotiationTip:
        "Request exclusion for inventions developed entirely on personal time without company resources.",
      affectedByMismatch: false,
    },
    {
      id: "clause-3",
      title: "At-Will Employment",
      originalExcerpt:
        "Employment is at-will and may be terminated by either party at any time, with or without cause.",
      plainEnglish: "You can be fired at any time for any reason (or no reason).",
      riskLevel: "GREEN",
      riskReason:
        "At-will employment is the default standard in New York and nearly all US states.",
      comparisonToStandard:
        "This is the standard at-will provision used in US employment contracts.",
      obligation: "Either party may terminate employment at any time.",
      affectedByMismatch: false,
    },
    {
      id: "clause-4",
      title: "Severance Terms",
      originalExcerpt:
        "Upon termination without cause, employee shall receive severance as determined by the company in its sole discretion.",
      plainEnglish:
        "If you're fired without cause, the company decides how much severance you get (if any).",
      riskLevel: "CONTEXT_DEPENDENT",
      riskReason:
        "Severance adequacy depends on company size, industry, and the employee's level/tenure — which are not visible in the contract.",
      comparisonToStandard:
        "Standard executive contracts specify severance as a formula (e.g., N weeks per year of service).",
      obligation: "No guaranteed severance amount.",
      contextNote:
        "The risk depends on the company's size and your seniority — ask for a specific severance formula.",
      affectedByMismatch: false,
    },
  ],
  missingClauses: [
    {
      title: "Expense Reimbursement",
      whyItMatters: "No provision for reimbursement of work-related expenses.",
      whatToAskFor:
        "Add clause requiring reimbursement of pre-approved business expenses within 30 days.",
    },
  ],
  keyDates: [
    {
      label: "Non-compete duration",
      value: "24 months post-termination",
      urgency: "HIGH",
    },
    {
      label: "Notice period",
      value: "At-will, no notice required",
      urgency: "MEDIUM",
    },
  ],
  yourRights: ["Terminate employment at any time (at-will)"],
  yourObligations: [
    "Refrain from competing for 24 months post-termination",
    "Assign all inventions to employer",
    "Maintain confidentiality",
  ],
  analyzedAt: "2026-05-18T12:00:00.000Z",
  analysisId: "660e8400-e29b-41d4-a716-446655440001",
  followUpQuestionsRemaining: 3,
};

export const sampleDocumentText = `EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is entered into between Acme Corp, a Delaware corporation with offices in New York, NY ("Employer"), and John Doe, residing in San Francisco, CA ("Employee").

1. Employment Terms. Employee is employed as Senior Software Engineer. Employment is at-will and may be terminated by either party at any time, with or without cause.

2. Non-Compete. Employee agrees not to compete with Employer anywhere in the United States for a period of 24 months following termination.

3. Intellectual Property. Employee hereby assigns all inventions, whether or not developed during work hours or using company equipment.

4. Governing Law. This Agreement shall be governed by and construed in accordance with the laws of the State of New York.

5. Confidentiality. Employee shall maintain confidentiality of all proprietary information during and after employment.`;
