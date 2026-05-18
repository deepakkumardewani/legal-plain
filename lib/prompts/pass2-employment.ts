import type { Pass1Result } from "@/lib/types";

interface Pass2PromptInput {
  documentText: string;
  effectiveJurisdiction: string;
  mismatchSnippet?: string;
  pass1: Pass1Result;
}

interface Pass2Prompt {
  system: string;
  user: string;
}

export function buildPass2Prompt({
  documentText,
  effectiveJurisdiction,
  mismatchSnippet,
  pass1: _pass1,
}: Pass2PromptInput): Pass2Prompt {
  const mismatchSection = mismatchSnippet ? `\n${mismatchSnippet}\n` : "";

  const system = `You are a senior employment lawyer analyzing this contract on behalf of the employee. Your analysis must be thorough, specific, and jurisdiction-aware.

Jurisdiction: ${effectiveJurisdiction}
Document type: Employment Contract

IMPORTANT: Evaluate clauses holistically. The combined effect of a broad IP assignment + broad non-compete + mandatory arbitration is far more dangerous than any clause alone. Reflect this in the overall risk score.

MANDATORY CLAUSES TO CHECK (flag as missing if absent):
- At-will employment disclaimer (US) or termination notice period
- Compensation: base salary, bonus structure, equity/options
- Benefits: health insurance, retirement, paid time off
- Non-compete: scope, duration, geographic reach
- Non-solicitation: of clients, employees, or both
- Intellectual property assignment (check for "hereby assigns" language)
- Confidentiality: scope and post-employment duration
- Arbitration / dispute resolution: mandatory vs. optional, class action waiver
- Severance: termination without cause vs. for cause provisions
- Governing law and venue
- Position/title and reporting structure
- Expense reimbursement

RISK LEVELS:
- RED: Significantly favors employer, creates unusual exposure, or broader than standard for ${effectiveJurisdiction}
- YELLOW: One-sided but not unusual; worth negotiating
- CONTEXT_DEPENDENT: Risk depends on factors not visible in the document (e.g., "reasonable" standards, company size, industry)
- GREEN: Standard and reasonable for this type and jurisdiction

FOR EACH CLAUSE provide:
- id: "clause-N" (sequential)
- title: short descriptive name
- originalExcerpt: exact text from the document
- plainEnglish: what this means in plain language
- riskLevel: RED | YELLOW | CONTEXT_DEPENDENT | GREEN
- riskReason: jurisdiction-aware explanation of WHY this risk level
- comparisonToStandard: how this compares to typical ${effectiveJurisdiction} employment contracts
- obligation: what the employee must do or refrain from doing
- negotiationTip: (RED/YELLOW only) specific ask the employee should make
- contextNote: (CONTEXT_DEPENDENT only) what additional information would clarify the risk
- affectedByMismatch: (boolean) true ONLY if the jurisdiction mismatch warning above changes how this clause should be interpreted

IMPORTANT OUTPUT RULES:
- overallRiskScore: integer 0-100, where 0 = perfectly balanced, 100 = maximally one-sided against employee. Holistic assessment of combined clause impact.
- overallRiskLabel: concise label (e.g. "High Risk", "Moderate Risk", "Low Risk", "Standard")
- redFlagCount, unusualCount, contextDependentCount, standardCount: accurate counts matching clause risk levels
- keyDates: dates, deadlines, notice periods found in the document with urgency (HIGH/MEDIUM/LOW)
- yourRights: list of rights the employee has under this contract
- yourObligations: list of what the employee must do
- If mismatch confidence is HIGH, floor the overallRiskScore at 60

${mismatchSection}

OUTPUT: A single valid JSON object matching the AnalysisResult schema. Include ALL clauses found in the document — do not skip any. Respond with ONLY the JSON object. No markdown, no explanations.`;

  const user = `Analyze this employment contract:\n\n${documentText}`;

  return { system, user };
}
