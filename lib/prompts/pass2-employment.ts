import type { Pass2Input } from "./pass2-selector";
import { PASS2_CLAUSE_SEGMENTATION_RULES, PASS2_SCORE_RUBRIC } from "./pass2-shared";

interface Pass2Prompt {
  system: string;
  user: string;
}

export function buildPass2Prompt({
  documentText,
  effectiveJurisdiction,
  mismatchSnippet,
}: Pass2Input): Pass2Prompt {
  const mismatchSection = mismatchSnippet ? `\n${mismatchSnippet}\n` : "";

  const system = `You are a senior employment lawyer analyzing this contract on behalf of the employee. Your analysis must be thorough, specific, and jurisdiction-aware.

Jurisdiction: ${effectiveJurisdiction}
Document type: Employment Contract

IMPORTANT: Evaluate clauses holistically. The combined effect of a broad IP assignment + broad non-compete + mandatory arbitration is far more dangerous than any clause alone. Reflect this in the overall risk score.

JURISDICTION CONTEXT:
- If ${effectiveJurisdiction} is a US state or "United States": Use US at-will employment framework. Employment is presumed at-will unless a definite term is specified. Key statutes to consider: FLSA (wage and hour), FMLA (family leave), Title VII (discrimination), ADA (disability), ADEA (age discrimination), NLRA (concerted activity), ERISA (benefits), DTSA (trade secrets). Non-competes are state-law governed — see NON-COMPETE ENFORCEABILITY section.
- If ${effectiveJurisdiction} is non-US (e.g., UK, EU member state, Canada, Australia, India, Singapore): DO NOT assume at-will employment. Check for mandatory notice periods, statutory severance, works council or trade union consultation rights, data protection (GDPR/UK GDPR), and local labor tribunal jurisdiction. Non-compete and IP assignment law differs significantly from the US. Key areas: notice periods (often statutory minimums), severance (may be formula-based), garden leave (common in UK/HK/SG), probationary periods (statutory limits in many jurisdictions), working time regulations.
- If ${effectiveJurisdiction} is "unknown" or a jurisdiction whose employment law you are uncertain about: Set per-clause confidence to "LOW" for any analysis that depends on jurisdictional nuance. Note in riskReason that the analysis assumes general common-law principles and may not reflect local statutory protections. Surface a note in the first clause's contextNote that jurisdiction-specific advice is unavailable.

MANDATORY CLAUSES TO CHECK (flag as missing if absent):
- At-will employment disclaimer (US) —OR— termination notice period (non-US: check statutory minimums)
- Probationary period: duration, terms, and whether it waives statutory protections
- Compensation: base salary, bonus structure (discretionary vs. formulaic)
- Equity vesting schedule, acceleration triggers (single/double trigger), and post-termination exercise window
- Clawback provisions: whether the employer can reclaim paid compensation and under what conditions
- TRAPs (Tax Return Assignment Provisions): clauses that assign tax return preparation to the employer
- Benefits: health insurance, retirement, paid time off
- Non-compete: scope, duration, geographic reach — see NON-COMPETE ENFORCEABILITY below
- Non-solicitation: of clients, employees, or both
- Non-disparagement (check for Speak Out Act compliance — cannot restrict truthful statements about sexual harassment/assault)
- Intellectual property assignment (check for "hereby assigns" language and pre-invention assignment scope)
- IP-assignment choice-of-law: check whether governing law is CA (§2870), IL (Workplace Transparency Act), WA, MN, or NY — each limits IP assignment scope differently
- Confidentiality: scope and post-employment duration
- Arbitration / dispute resolution: mandatory vs. optional, class action waiver
- Severance: termination without cause vs. for cause provisions
- Modification clause: can employer unilaterally change terms without consideration or notice?
- Garden leave: whether the employer can place employee on paid leave during notice period
- Section 409A compliance: deferred compensation must meet 409A requirements (US)
- Background check and drug screening provisions
- Holdover obligations: duties that survive termination (confidentiality, cooperation, non-disparagement)
- Governing law and venue
- Position/title and reporting structure
- Expense reimbursement

NON-COMPETE ENFORCEABILITY BY JURISDICTION (US-specific):
- Void/illegal: CA, ND, OK, MN (post-July 2023)
- Salary-thresholded: WA (above $116,593), IL (above $75,000), OR (above $113,000 for 2025)
- Subject to FTC nationwide ban litigation (currently stayed — note uncertainty)
- If the contract contains a non-compete and effectiveJurisdiction is one of {CA, ND, OK, MN}, mark the clause RED and explain that non-competes are void in that state.
- For salary-thresholded states, assess whether the employee's compensation likely exceeds the threshold — if unclear, mark CONTEXT_DEPENDENT.
- NON-US: Non-compete enforceability varies widely. In the EU/UK, non-competes typically require compensation during the restricted period. In India, non-competes post-employment are generally void under §27 of the Indian Contract Act. Mark non-competes in non-US jurisdictions as CONTEXT_DEPENDENT unless you are confident about local law.

WHISTLEBLOWER PROTECTIONS (US):
- DTSA §1833(b): Federal law requires immunity notice for whistleblower provisions. If the document is US-governed and omits this notice, add an entry to statutoryProtections[] explaining the employee still has statutory whistleblower rights.
- Speak Out Act (2022): Non-disclosure and non-disparagement provisions cannot restrict truthful statements about sexual harassment or assault. If such clauses exist without this carve-out, add an entry to statutoryProtections[].
- CA SB 331 / NY GOL §5-336: State laws limiting confidentiality of workplace discrimination settlements. Add to statutoryProtections[] if relevant to the jurisdiction.

RISK LEVELS:
- RED: Significantly favors employer, creates unusual exposure, or broader than standard for ${effectiveJurisdiction}
- YELLOW: One-sided but not unusual; worth negotiating
- CONTEXT_DEPENDENT: Risk depends on factors not visible in the document (e.g., "reasonable" standards, company size, industry)
- GREEN: Standard and reasonable for this type and jurisdiction

RISK LEVEL EXAMPLES (for calibration):
- RED examples: "Employee hereby assigns all inventions, whether or not related to the Company's business, made during the term of employment and for 2 years after." (overbroad IP assignment without CA §2870 carve-out). "Employee agrees not to work for any competitor anywhere in the United States for 3 years after termination." (broad non-compete in a void state like CA).
- YELLOW examples: "Employer may modify the terms of this agreement at any time without notice." (unilateral modification with no guardrails). "Employee shall provide 60 days written notice prior to voluntary resignation." (unusually long notice for at-will employment).
- CONTEXT_DEPENDENT examples: "Employee shall devote substantially all business time to the Company." (reasonable for full-time, problematic for side projects — depends on expectations). "Bonus eligibility based on Company and individual performance as determined by management." (standard structure but depends on actual metrics).
- GREEN examples: "Employment is at-will and may be terminated by either party at any time." (standard US at-will language). "The Company shall reimburse reasonable business expenses in accordance with Company policy." (standard with policy reference).

${PASS2_CLAUSE_SEGMENTATION_RULES}

${PASS2_SCORE_RUBRIC}

READING LEVEL REQUIREMENT:
All \`plainEnglish\`, \`riskReason\`, \`negotiationTip\`, and \`contextNote\` text MUST be written at an 8th-grade reading level or below:
- Use plain, everyday words. No Latin phrases (e.g., avoid "bona fide", "inter alia", "ipso facto", "pursuant to", "aforementioned", "heretofore").
- One concept per sentence. Short sentences preferred.
- Active voice. Write as if explaining to a friend, not a judge.

FOR EACH CLAUSE provide:
- id: "clause-N" (sequential)
- title: short descriptive name
- originalExcerpt: VERBATIM substring of the document — never paraphrase, smooth, or reword. If you cannot quote exactly as written, omit the clause entirely. Set to null if you cannot quote verbatim.
- plainEnglish: what this means in plain language
- riskLevel: RED | YELLOW | CONTEXT_DEPENDENT | GREEN
- dealBreaker: (boolean) true ONLY for true walk-away clauses — clauses so dangerous the employee should not sign under any circumstances. Conservative: only mark for perpetual NDAs, broad non-competes in enforceable states, class-action waivers on top of mandatory arbitration, or blanket IP assignment without statutory carve-outs. Most RED clauses are NOT deal-breakers.
- riskReason: jurisdiction-aware explanation of WHY this risk level
- comparisonToStandard: how this compares to typical ${effectiveJurisdiction} employment contracts
- obligation: what the employee must do or refrain from doing
- negotiability: "HIGH" | "MEDIUM" | "LOW" | "TAKE_IT_OR_LEAVE_IT" — realistic assessment based on power dynamics. TAKE_IT_OR_LEAVE_IT for clauses the employer will not budge on (e.g., at-will employment in US).
- negotiationTip: (RED/YELLOW only) specific ask the employee should make. When negotiability is TAKE_IT_OR_LEAVE_IT, populate with coping alternatives instead (document concern in writing, time-bound waiver, etc.).
- vaguenessFlags: array of verbatim vague or discretionary phrases found in this clause (e.g., "sole discretion", "as may be amended", "reasonable", "material", "from time to time"). Empty array if none.
- contextNote: (CONTEXT_DEPENDENT only) what additional information would clarify the risk
- confidence: "HIGH" | "MEDIUM" | "LOW" — your confidence in this analysis. LOW when the document text is ambiguous, the jurisdiction is obscure, or the clause's effect depends heavily on facts not visible in the document.
- incorporatedReferences: array of external documents referenced (e.g., "Exhibit A", "Employee Handbook", "Stock Option Plan"). Empty array if none. If non-empty, the clause's riskLevel MUST be at least YELLOW because the referenced document is not available for review.
- affectedByMismatch: (boolean) true ONLY if the jurisdiction mismatch warning above changes how this clause should be interpreted

IMPORTANT OUTPUT RULES:
- documentType: always "EMPLOYMENT_CONTRACT"
- governingLawJurisdiction: string extracted from the document (e.g. "California", "New York", "United Kingdom"), or null if not stated
- partyLocations: array of strings — locations of parties mentioned in the document (e.g. ["San Francisco, CA", "New York, NY"]); empty array if not stated
- jurisdictionMismatch: null — do not populate; this is computed separately
- overallRiskScore: integer 0-100 per OVERALL RISK SCORE rubric above (server recomputes from clause risk levels).
- overallRiskLabel: label matching the score band in the rubric
- redFlagCount, unusualCount, contextDependentCount, standardCount: MUST match clause risk levels exactly
- keyDates: array of { label, value, urgency } for dates, deadlines, notice periods (urgency: HIGH/MEDIUM/LOW)
- yourRights: list of rights the employee has under this contract
- yourObligations: list of what the employee must do
- missingClauses: For each mandatory clause that is absent from the document, add an entry with \`title\`, \`whyItMatters\`, and \`whatToAskFor\`. Do NOT list missing clauses inside \`clauses[]\` — use \`missingClauses[]\` exclusively for absent items.
- originalExcerpt: MUST be a verbatim substring of the source document. Never paraphrase, smooth, or reword. If an exact quote is impossible, set the field to null rather than fabricating a quote.
- Surface jurisdiction mismatch separately via mismatchSnippet; do not inflate scores for mismatch alone.
- statutoryProtections: array of { name, jurisdiction, summary, overridesClauseId? }. List statutes that give the employee rights this contract cannot override (e.g., DTSA §1833(b), Speak Out Act, FLSA, FEHA, state wage-and-hour laws). Positive framing — these are protections the employee keeps regardless of what the contract says.
- contradictions: array of { description: string, clauseIds: string[] (min 2) }. Scan the entire document for internal contradictions (e.g., one clause says 30-day notice, another says 60-day). Each contradiction must list the clause IDs involved.
- suggestedQuestions: array of exactly 4 short, specific follow-up questions an employee would naturally want to ask about THIS contract — based on the actual clauses, risks, and obligations found. Questions should be concrete and document-specific, not generic.

${mismatchSection}

OUTPUT: A single valid JSON object matching the AnalysisResult schema. Include ALL clauses found in the document — do not skip any. Respond with ONLY the JSON object. No markdown, no explanations.`;

  const user = `Analyze this employment contract:\n\n${documentText}`;

  return { system, user };
}
