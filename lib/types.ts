export type DocumentType = "EMPLOYMENT_CONTRACT" | "NDA" | "RESIDENTIAL_LEASE";
export type RiskLevel = "RED" | "YELLOW" | "CONTEXT_DEPENDENT" | "GREEN";

export interface JurisdictionMismatch {
  governingLaw: string;
  partyLocations: string[];
  confidence: "HIGH" | "LOW";
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  plainEnglish: string;
  whyItMatters: string;
  affectedClauseIds: string[];
  whatToAskFor: string;
}

export interface ClauseAnalysis {
  id: string;
  title: string;
  originalExcerpt: string | null;
  plainEnglish: string;
  riskLevel: RiskLevel;
  riskReason: string;
  contextNote?: string | null;
  vaguenessFlags?: string[] | null;
  comparisonToStandard: string;
  obligation: string;
  negotiationTip?: string | null;
  negotiability?: "HIGH" | "MEDIUM" | "LOW" | "TAKE_IT_OR_LEAVE_IT" | null;
  affectedByMismatch?: boolean | null;
  confidence?: "HIGH" | "MEDIUM" | "LOW" | null;
  incorporatedReferences?: string[] | null;
  dealBreaker?: boolean | null;
}

export interface MissingClause {
  title: string;
  whyItMatters: string;
  whatToAskFor: string;
}

export interface Contradiction {
  description: string;
  clauseIds: string[];
}

export interface StatutoryProtection {
  name: string;
  jurisdiction: string;
  summary: string;
  overridesClauseId?: string | null;
}

export interface KeyDate {
  label: string;
  value: string;
  urgency: "HIGH" | "MEDIUM" | "LOW";
}

export interface Pass1Result {
  valid: boolean;
  reason?: string;
  documentType: DocumentType;
  governingLawJurisdiction: string | null;
  partyLocations: string[];
  jurisdictionMismatch: boolean;
  mismatchConfidence: "HIGH" | "LOW" | null;
  clauseMap: string[];
  subtype?: "residential" | "commercial" | "ambiguous" | null;
}

export interface AnalysisResult {
  documentType: DocumentType;
  governingLawJurisdiction: string | null;
  partyLocations: string[];
  userJurisdiction: string | null;
  effectiveJurisdiction: string;
  jurisdictionMismatch: JurisdictionMismatch | null;
  overallRiskScore: number;
  overallRiskLabel: string;
  redFlagCount: number;
  unusualCount: number;
  contextDependentCount: number;
  standardCount: number;
  clauses: ClauseAnalysis[];
  missingClauses: MissingClause[];
  statutoryProtections?: StatutoryProtection[];
  contradictions?: Contradiction[];
  keyDates: KeyDate[];
  yourRights: string[];
  yourObligations: string[];
  analysisId: string;
  analyzedAt: string;
  followUpQuestionsRemaining: number;
}

export interface AnalyzeRequest {
  documentText: string;
  userJurisdiction: string | null;
  userId: string;
}

export interface FollowupRequest {
  question: string;
  analysisResult: AnalysisResult;
  documentText: string;
  userId: string;
  analysisId: string;
}

export interface ShareRequest {
  analysisResult: AnalysisResult;
  userId: string;
}
