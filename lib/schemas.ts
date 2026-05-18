import { z } from "zod";

const documentTypeSchema = z.enum(["EMPLOYMENT_CONTRACT", "NDA", "RESIDENTIAL_LEASE"]);

const riskLevelSchema = z.enum(["RED", "YELLOW", "CONTEXT_DEPENDENT", "GREEN"]);

const jurisdictionMismatchSchema = z.object({
  governingLaw: z.string().min(1),
  partyLocations: z.array(z.string().min(1)),
  confidence: z.enum(["HIGH", "LOW"]),
  riskLevel: z.enum(["HIGH", "MEDIUM", "LOW"]),
  plainEnglish: z.string().min(1),
  whyItMatters: z.string().min(1),
  affectedClauseIds: z.array(z.string().min(1)),
  whatToAskFor: z.string().min(1),
});

const clauseAnalysisSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  originalExcerpt: z.string(),
  plainEnglish: z.string().min(1),
  riskLevel: riskLevelSchema,
  riskReason: z.string().min(1),
  contextNote: z.string().optional(),
  comparisonToStandard: z.string().min(1),
  obligation: z.string().min(1),
  negotiationTip: z.string().optional(),
  affectedByMismatch: z.boolean().optional(),
});

const missingClauseSchema = z.object({
  title: z.string().min(1),
  whyItMatters: z.string().min(1),
  whatToAskFor: z.string().min(1),
});

const keyDateSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  urgency: z.enum(["HIGH", "MEDIUM", "LOW"]),
});

export const pass1ResultSchema = z.object({
  valid: z.boolean(),
  reason: z.string().optional(),
  documentType: documentTypeSchema,
  governingLawJurisdiction: z.string().nullable(),
  partyLocations: z.array(z.string()),
  jurisdictionMismatch: z.boolean(),
  mismatchConfidence: z.enum(["HIGH", "LOW"]).nullable(),
  clauseMap: z.array(z.string()),
});

export const analysisResultSchema = z.object({
  documentType: documentTypeSchema,
  governingLawJurisdiction: z.string().nullable(),
  partyLocations: z.array(z.string()),
  userJurisdiction: z.string().nullable(),
  effectiveJurisdiction: z.string().min(1),
  jurisdictionMismatch: jurisdictionMismatchSchema.nullable(),
  overallRiskScore: z.number().int().min(0).max(100),
  overallRiskLabel: z.string().min(1),
  redFlagCount: z.number().int().min(0),
  unusualCount: z.number().int().min(0),
  contextDependentCount: z.number().int().min(0),
  standardCount: z.number().int().min(0),
  clauses: z.array(clauseAnalysisSchema),
  missingClauses: z.array(missingClauseSchema),
  keyDates: z.array(keyDateSchema),
  yourRights: z.array(z.string()),
  yourObligations: z.array(z.string()),
  analyzedAt: z.string().datetime(),
  followUpQuestionsRemaining: z.number().int().min(0).max(10),
});

export const analyzeRequestSchema = z.object({
  documentText: z
    .string()
    .min(1, "Document text is required")
    .max(150000, "Document exceeds 150,000 character limit"),
  userJurisdiction: z.string().nullable(),
  userId: z.string().uuid("Invalid userId format"),
});

export const followupRequestSchema = z.object({
  question: z
    .string()
    .min(1, "Question is required")
    .max(500, "Question exceeds 500 character limit"),
  analysisResult: analysisResultSchema,
  documentText: z.string().min(1),
  userId: z.string().uuid("Invalid userId format"),
  analysisId: z.string().uuid("Invalid analysisId format"),
});

export const shareRequestSchema = z.object({
  analysisResult: analysisResultSchema,
  userId: z.string().uuid("Invalid userId format"),
});

export const followupResponseSchema = z.object({
  answer: z.string().min(1),
  citedClauseIds: z.array(z.string()),
});

export type { z };
