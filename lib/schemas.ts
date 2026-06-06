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

// LLMs output `null` for absent optional fields — use .nullish() (null | undefined | T) throughout
const clauseAnalysisSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  originalExcerpt: z.string().nullable(),
  plainEnglish: z.string().min(1),
  riskLevel: riskLevelSchema,
  riskReason: z.string().min(1),
  contextNote: z.string().nullish(),
  vaguenessFlags: z.array(z.string()).nullish(),
  comparisonToStandard: z.string().min(1),
  obligation: z.string().min(1),
  negotiationTip: z.string().nullish(),
  negotiability: z.enum(["HIGH", "MEDIUM", "LOW", "TAKE_IT_OR_LEAVE_IT"]).nullish(),
  affectedByMismatch: z.boolean().nullish(),
  confidence: z.enum(["HIGH", "MEDIUM", "LOW"]).nullish(),
  incorporatedReferences: z.array(z.string()).nullish(),
  dealBreaker: z.boolean().nullish(),
});

const missingClauseSchema = z.object({
  title: z.string().min(1),
  whyItMatters: z.string().min(1),
  whatToAskFor: z.string().min(1),
});

const contradictionSchema = z.object({
  description: z.string().min(1),
  clauseIds: z.array(z.string()),
});

const statutoryProtectionSchema = z.object({
  name: z.string().min(1),
  jurisdiction: z.string().min(1),
  summary: z.string().min(1),
  overridesClauseId: z.string().nullish(),
});

const keyDateSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  urgency: z.enum(["HIGH", "MEDIUM", "LOW"]),
});

export const pass1ResultSchema = z.object({
  valid: z.boolean(),
  reason: z.string().nullable().optional(),
  documentType: documentTypeSchema,
  governingLawJurisdiction: z.string().nullable(),
  partyLocations: z.array(z.string()),
  jurisdictionMismatch: z.boolean(),
  mismatchConfidence: z.enum(["HIGH", "LOW"]).nullable(),
  clauseMap: z.array(z.string()),
  subtype: z.enum(["residential", "commercial", "ambiguous"]).nullable().optional(),
});

// Fields the AI must produce — top-level metadata fields are optional here
// because prompts don't instruct the AI to produce them; route.ts fills them in.
export const aiAnalysisResultSchema = z.object({
  documentType: documentTypeSchema.optional(),
  governingLawJurisdiction: z.string().nullable().optional(),
  partyLocations: z.array(z.string()).optional(),
  jurisdictionMismatch: jurisdictionMismatchSchema.nullable().optional(),
  overallRiskScore: z.number().int().min(0).max(100),
  overallRiskLabel: z.string().min(1),
  redFlagCount: z.number().int().min(0),
  unusualCount: z.number().int().min(0),
  contextDependentCount: z.number().int().min(0),
  standardCount: z.number().int().min(0),
  clauses: z.array(clauseAnalysisSchema),
  missingClauses: z.array(missingClauseSchema),
  statutoryProtections: z.array(statutoryProtectionSchema).optional(),
  contradictions: z.array(contradictionSchema).optional(),
  keyDates: z.array(keyDateSchema),
  yourRights: z.array(z.string()),
  yourObligations: z.array(z.string()),
});

// Full shape after server enrichment (used for followup/share validation)
// Server-enriched shape: the parent aiAnalysisResultSchema makes these optional
// because the AI prompts don't produce them, but route.ts always fills them in.
// Override them to required (or nullable-required) so the enriched type matches AnalysisResult.
export const analysisResultSchema = aiAnalysisResultSchema.extend({
  documentType: documentTypeSchema,
  governingLawJurisdiction: z.string().nullable(),
  partyLocations: z.array(z.string()),
  jurisdictionMismatch: jurisdictionMismatchSchema.nullable(),
  userJurisdiction: z.string().nullable(),
  effectiveJurisdiction: z.string().min(1),
  analysisId: z.string().uuid(),
  analyzedAt: z.string().datetime(),
  followUpQuestionsRemaining: z.number().int().min(0),
});

export const analyzeRequestSchema = z.object({
  documentText: z
    .string()
    .min(1, "Document is required")
    .max(150000, "Document exceeds 150,000 character limit"),
  documentType: documentTypeSchema,
  userId: z.string().uuid("Invalid userId format"),
});

export const followupRequestSchema = z.object({
  question: z
    .string()
    .min(1, "Question is required")
    .max(500, "Question exceeds 500 character limit"),
  analysisResult: analysisResultSchema,
  documentText: z.string().min(1).max(150000, "Document exceeds 150,000 character limit"),
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
