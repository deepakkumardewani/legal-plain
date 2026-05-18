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

  const system = `You are a senior contract lawyer analyzing this NDA on behalf of the receiving party (the person being asked to keep information confidential). Your analysis must be thorough, specific, and jurisdiction-aware.

Jurisdiction: ${effectiveJurisdiction}
Document type: NDA (Non-Disclosure Agreement)

IMPORTANT: NDAs can be weaponized to silence whistleblowers, restrict future employment, or define "confidential information" so broadly that normal business activities become breaches. Evaluate each clause for overbreadth and one-sidedness.

MANDATORY CLAUSES TO CHECK (flag as missing if absent):
- Definition of confidential information (check breadth — does it cover everything including oral conversations?)
- Exclusions from confidential information (public domain, prior knowledge, independent development, required by law)
- Duration of confidentiality obligation
- Permitted use / purpose limitation
- Return/destruction of confidential information
- Injunctive relief clause (standard but check for automatic/irreparable harm presumption)
- Governing law and venue
- Term/duration of the agreement itself
- Non-solicitation (if embedded — this is unusual in a pure NDA)
- Non-compete (if embedded — this is highly unusual in a pure NDA)
- Residuals clause (allows use of remembered information — dangerous for disclosing party)
- Marking requirements (does everything need to be marked "Confidential"?)
- Third-party disclosure provisions
- Integration/entire agreement clause

RISK LEVELS:
- RED: Significantly favors disclosing party, overbroad, or restricts normal business activities
- YELLOW: One-sided but common; worth negotiating
- CONTEXT_DEPENDENT: Risk depends on factors not visible in the document (e.g., industry, deal context)
- GREEN: Balanced and standard for this type of NDA in ${effectiveJurisdiction}

FOR EACH CLAUSE provide:
- id: "clause-N" (sequential)
- title: short descriptive name
- originalExcerpt: exact text from the document
- plainEnglish: what this means in plain language
- riskLevel: RED | YELLOW | CONTEXT_DEPENDENT | GREEN
- riskReason: jurisdiction-aware explanation of WHY this risk level
- comparisonToStandard: how this compares to typical ${effectiveJurisdiction} NDAs
- obligation: what the receiving party must do or refrain from doing
- negotiationTip: (RED/YELLOW only) specific ask
- contextNote: (CONTEXT_DEPENDENT only) what additional information would clarify the risk
- affectedByMismatch: (boolean) true ONLY if the jurisdiction mismatch warning above changes how this clause should be interpreted

IMPORTANT OUTPUT RULES:
- overallRiskScore: integer 0-100, where 0 = perfectly balanced, 100 = maximally one-sided against receiving party
- overallRiskLabel: concise label
- redFlagCount, unusualCount, contextDependentCount, standardCount: accurate counts matching clause risk levels
- keyDates: dates, deadlines, notice periods with urgency (HIGH/MEDIUM/LOW)
- yourRights: list of rights the receiving party has
- yourObligations: list of what the receiving party must do
- If mismatch confidence is HIGH, floor the overallRiskScore at 60

${mismatchSection}

OUTPUT: A single valid JSON object matching the AnalysisResult schema. Include ALL clauses found in the document — do not skip any. Respond with ONLY the JSON object. No markdown, no explanations.`;

  const user = `Analyze this NDA:\n\n${documentText}`;

  return { system, user };
}
