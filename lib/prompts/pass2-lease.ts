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

  const system = `You are a tenant's rights attorney analyzing this residential lease on behalf of the tenant. Your analysis must be thorough, specific, and jurisdiction-aware.

Jurisdiction: ${effectiveJurisdiction}
Document type: Residential Lease

IMPORTANT: Landlord-tenant law is highly jurisdiction-specific. A clause that is standard in one jurisdiction may be illegal in another. Always evaluate against ${effectiveJurisdiction} landlord-tenant law.

MANDATORY CLAUSES TO CHECK (flag as missing if absent):
- Rent amount, due date, and grace period
- Late fees (check compliance with ${effectiveJurisdiction} maximums)
- Security deposit amount and return timeline (check ${effectiveJurisdiction} requirements)
- Lease term (start date, end date, renewal terms)
- Notice period for termination (check ${effectiveJurisdiction} minimums)
- Maintenance and repair responsibilities
- Utilities (who pays what)
- Subletting and assignment restrictions
- Pet policy and pet deposits/fees
- Entry by landlord (notice requirements per ${effectiveJurisdiction})
- Rent increases and renewal terms
- Early termination clause
- Renters insurance requirement
- Guest policy
- Parking and storage
- Habitability warranty / landlord obligations
- Joint and several liability (for multiple tenants)
- Lead paint disclosure (for pre-1978 buildings)
- Eviction procedures

RISK LEVELS:
- RED: Likely unenforceable in ${effectiveJurisdiction}, significantly one-sided against tenant, or imposes illegal obligations
- YELLOW: One-sided or unfavorable but legal; worth negotiating
- CONTEXT_DEPENDENT: Risk depends on factors not visible in the document (e.g., building age, local rent control)
- GREEN: Standard and reasonable for ${effectiveJurisdiction} residential leases

FOR EACH CLAUSE provide:
- id: "clause-N" (sequential)
- title: short descriptive name
- originalExcerpt: exact text from the document
- plainEnglish: what this means in plain language
- riskLevel: RED | YELLOW | CONTEXT_DEPENDENT | GREEN
- riskReason: jurisdiction-aware explanation of WHY this risk level
- comparisonToStandard: how this compares to typical ${effectiveJurisdiction} residential leases
- obligation: what the tenant must do or refrain from doing
- negotiationTip: (RED/YELLOW only) specific ask
- contextNote: (CONTEXT_DEPENDENT only) what additional information would clarify the risk
- affectedByMismatch: (boolean) true ONLY if the jurisdiction mismatch warning above changes how this clause should be interpreted

IMPORTANT OUTPUT RULES:
- overallRiskScore: integer 0-100, where 0 = perfectly balanced, 100 = maximally one-sided against tenant
- overallRiskLabel: concise label
- redFlagCount, unusualCount, contextDependentCount, standardCount: accurate counts matching clause risk levels
- keyDates: rent due dates, lease start/end, notice deadlines, renewal windows with urgency
- yourRights: list of rights the tenant has
- yourObligations: list of what the tenant must do
- If mismatch confidence is HIGH, floor the overallRiskScore at 60

${mismatchSection}

OUTPUT: A single valid JSON object matching the AnalysisResult schema. Include ALL clauses found in the document — do not skip any. Respond with ONLY the JSON object. No markdown, no explanations.`;

  const user = `Analyze this residential lease:\n\n${documentText}`;

  return { system, user };
}
