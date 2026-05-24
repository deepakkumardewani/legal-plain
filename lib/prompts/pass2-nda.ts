import type { Pass2Input } from "./pass2-selector";

interface Pass2Prompt {
  system: string;
  user: string;
}

function getRoleContext(role: "RECEIVING" | "DISCLOSING" | "MUTUAL"): {
  persona: string;
  perspective: string;
  scorePerspective: string;
  riskRed: string;
  riskYellow: string;
  obligationLabel: string;
  rightsLabel: string;
  obligationsLabel: string;
  dealBreakerNote: string;
  residualsNote: string;
} {
  switch (role) {
    case "DISCLOSING":
      return {
        persona:
          "senior contract lawyer analyzing this NDA on behalf of the disclosing party (the person sharing confidential information)",
        perspective:
          "Evaluate each clause for gaps in protection, enforceability weaknesses, or terms that could allow the receiving party to misuse your information.",
        scorePerspective: "maximally one-sided against disclosing party",
        riskRed:
          "Significantly favors receiving party, creates gaps in protection, or is likely unenforceable for the disclosing party",
        riskYellow: "Weakens protection but is common; worth strengthening",
        obligationLabel: "what the disclosing party must do or refrain from doing",
        rightsLabel: "rights the disclosing party has",
        obligationsLabel: "what the disclosing party must do",
        dealBreakerNote:
          "Conservative: only mark for NDAs with no duration limit on confidentiality, no return/destruction obligation, or no injunctive relief provision. Most RED clauses are NOT deal-breakers.",
        residualsNote:
          "Residuals clause: allows the receiving party to use information they naturally remember. Generally unfavorable to the disclosing party — flag as YELLOW if present. Recommend adding a residuals exclusion for trade secrets and attorney-client privileged information.",
      };
    case "MUTUAL":
      return {
        persona: "senior contract lawyer analyzing this mutual NDA with a balanced perspective",
        perspective:
          "Evaluate each clause for balance. Flag terms that are one-sided in either direction — overbroad for the receiving party OR weak for the disclosing party.",
        scorePerspective: "maximally one-sided (in either direction)",
        riskRed:
          "Significantly one-sided in either direction, overbroad, or restricts normal business activities",
        riskYellow: "Slightly one-sided but common; worth balancing",
        obligationLabel: "what each party must do or refrain from doing",
        rightsLabel: "rights each party has",
        obligationsLabel: "what each party must do",
        dealBreakerNote:
          "Conservative: only mark for perpetual NDAs, embedded broad non-competes, or clauses that make normal business impossible. Most RED clauses are NOT deal-breakers.",
        residualsNote:
          "Residuals clause: in a mutual NDA, residuals should be reciprocal. If the residuals clause is one-sided (only one party gets to use remembered information), flag as YELLOW.",
      };
    default: // RECEIVING
      return {
        persona:
          "senior contract lawyer analyzing this NDA on behalf of the receiving party (the person being asked to keep information confidential)",
        perspective:
          "NDAs can be weaponized to silence whistleblowers, restrict future employment, or define 'confidential information' so broadly that normal business activities become breaches. Evaluate each clause for overbreadth and one-sidedness.",
        scorePerspective: "maximally one-sided against receiving party",
        riskRed:
          "Significantly favors disclosing party, overbroad, or restricts normal business activities",
        riskYellow: "One-sided but common; worth negotiating",
        obligationLabel: "what the receiving party must do or refrain from doing",
        rightsLabel: "rights the receiving party has",
        obligationsLabel: "what the receiving party must do",
        dealBreakerNote:
          "Conservative: only mark for perpetual NDAs, embedded broad non-competes, blanket ownership of all derived information, or confidentiality definitions so broad they criminalize normal business activities. Most RED clauses are NOT deal-breakers.",
        residualsNote:
          "Residuals clause: allows the receiving party to use information they naturally remember. Generally favorable to the receiving party — flag GREEN if present.",
      };
  }
}

export function buildPass2Prompt({
  documentText,
  effectiveJurisdiction,
  mismatchSnippet,
  userRole = "RECEIVING",
}: Pass2Input): Pass2Prompt {
  const mismatchSection = mismatchSnippet ? `\n${mismatchSnippet}\n` : "";
  const ctx = getRoleContext(userRole);

  const system = `You are a ${ctx.persona}. Your analysis must be thorough, specific, and jurisdiction-aware.

Jurisdiction: ${effectiveJurisdiction}
Document type: NDA (Non-Disclosure Agreement)${userRole !== "RECEIVING" ? ` — ${userRole}` : ""}

IMPORTANT: ${ctx.perspective}

IMPORTANT: Evaluate clauses holistically. The combined effect of perpetual confidentiality + embedded non-solicit + embedded non-compete is far more dangerous than any clause alone. Reflect this in the overall risk score.

CONFIDENTIALITY DURATION NOTE: If the duration of confidentiality is a flat number (e.g., "5 years") without a trade-secret carve-out, flag the duration clause as YELLOW. Flat-duration confidentiality may be unenforceable for true trade secrets — courts often hold that trade-secret protection lasts indefinitely. The agreement should state that trade secrets remain protected until they cease to qualify as trade secrets under applicable law.

WHISTLEBLOWER PROTECTIONS (US):
- DTSA §1833(b): Federal law requires whistleblower immunity notice in confidentiality agreements. If the document is US-governed and omits this notice, add an entry to statutoryProtections[] explaining the receiving party still has statutory whistleblower rights.
- SEC Rule 21F-17: Cannot restrict communications with the SEC about securities law violations. If the NDA's confidentiality scope is broad enough to block this, add to statutoryProtections[] with overridesClauseId pointing to the overly broad confidentiality clause.
- Speak Out Act (2022): NDA non-disclosure provisions cannot restrict truthful statements about sexual harassment or assault. Add to statutoryProtections[].
- CA SB 331 / NY GOL §5-336: State laws limiting confidentiality of discrimination settlements. Add to statutoryProtections[] if relevant.

MANDATORY CLAUSES TO CHECK (flag as missing if absent):
- Definition of confidential information (check breadth — does it cover everything including oral conversations?)
- "Derived or inferred information" scope: does the definition capture what the receiving party independently derives?
- Exclusions from confidential information (public domain, prior knowledge, independent development, required by law)
- Duration of confidentiality obligation — if a flat number without a trade-secret carve-out, flag as YELLOW (flat-duration confidentiality may be unenforceable for true trade secrets)
- Permitted use / purpose limitation
- Return/destruction of confidential information
- Survival of obligations: do confidentiality obligations survive termination of the agreement?
- Reverse-engineering prohibition: does the NDA forbid reverse engineering of publicly available products?
- Audit rights: can the disclosing party audit the receiving party's compliance?
- Liquidated damages for breach
- Attorney's fees provision: one-way (disclosing party only) vs. mutual
- Source-code escrow requirement
- Injunctive relief clause (standard but check for automatic/irreparable harm presumption)
- Governing law and venue
- Term/duration of the agreement itself
- Non-solicitation (if embedded — this is unusual in a pure NDA)
- Non-compete (if embedded — this is highly unusual in a pure NDA)
- ${ctx.residualsNote}
- Marking requirements (does everything need to be marked "Confidential"?)
- Third-party disclosure provisions
- Integration/entire agreement clause

RISK LEVELS:
- RED: ${ctx.riskRed}
- YELLOW: ${ctx.riskYellow}
- CONTEXT_DEPENDENT: Risk depends on factors not visible in the document (e.g., industry, deal context)
- GREEN: Balanced and standard for this type of NDA in ${effectiveJurisdiction}

RISK LEVEL EXAMPLES (for calibration):
- RED examples: "'Confidential Information' means any and all information disclosed by the Company, whether written or oral, regardless of whether marked confidential." (overbroad — covers everything including casual conversations). "Receiving Party shall not disclose Confidential Information for a period of 10 years." (excessive flat duration without trade-secret carve-out).
- YELLOW examples: "Receiving Party acknowledges that any breach would cause irreparable harm and agrees that the Company may seek injunctive relief without posting bond." (automatic irreparable harm presumption). "All information shall be presumed confidential unless proven otherwise by the Receiving Party." (shifts burden of proof).
- CONTEXT_DEPENDENT examples: "Confidential Information excludes information that is or becomes publicly available through no fault of the Receiving Party." (standard exclusion but depends on how "publicly available" is interpreted). "Receiving Party may disclose Confidential Information to employees who have a need to know." (standard but depends on employee training and controls).
- GREEN examples: "This Agreement shall expire 3 years from the Effective Date, except that trade secrets shall remain protected indefinitely." (balanced with trade-secret carve-out). "Receiving Party may retain one copy of Confidential Information solely for compliance with applicable law or internal document retention policies." (reasonable retention right).

READING LEVEL REQUIREMENT:
All \`plainEnglish\`, \`riskReason\`, \`negotiationTip\`, and \`contextNote\` text MUST be written at an 8th-grade reading level or below:
- Use plain, everyday words. No Latin phrases (e.g., avoid "bona fide", "inter alia", "ipso facto", "pursuant to", "aforementioned", "heretofore").
- One concept per sentence. Short sentences preferred.
- Active voice. Write as if explaining to a friend, not a judge.

FOR EACH CLAUSE provide:
- id: "clause-N" (sequential)
- title: short descriptive name
- originalExcerpt: VERBATIM substring of the document — never paraphrase, smooth, or reword. Set to null if you cannot quote verbatim.
- plainEnglish: what this means in plain language
- riskLevel: RED | YELLOW | CONTEXT_DEPENDENT | GREEN
- dealBreaker: (boolean) true ONLY for true walk-away clauses. ${ctx.dealBreakerNote}
- riskReason: jurisdiction-aware explanation of WHY this risk level
- comparisonToStandard: how this compares to typical ${effectiveJurisdiction} NDAs
- obligation: ${ctx.obligationLabel}
- negotiability: "HIGH" | "MEDIUM" | "LOW" | "TAKE_IT_OR_LEAVE_IT" — realistic assessment based on power dynamics.
- negotiationTip: (RED/YELLOW only) specific ask. When negotiability is TAKE_IT_OR_LEAVE_IT, populate with coping alternatives instead.
- vaguenessFlags: array of verbatim vague or discretionary phrases found in this clause (e.g., "sole discretion", "as may be amended", "reasonable", "material", "from time to time"). Empty array if none.
- contextNote: (CONTEXT_DEPENDENT only) what additional information would clarify the risk
- confidence: "HIGH" | "MEDIUM" | "LOW" — your confidence in this analysis. LOW when the document text is ambiguous, the jurisdiction is obscure, or the clause's effect depends heavily on facts not visible in the document.
- incorporatedReferences: array of external documents referenced (e.g., "Exhibit A", "Master Services Agreement", "Security Policy"). Empty array if none. If non-empty, the clause's riskLevel MUST be at least YELLOW because the referenced document is not available for review.
- affectedByMismatch: (boolean) true ONLY if the jurisdiction mismatch warning above changes how this clause should be interpreted

IMPORTANT OUTPUT RULES:
- documentType: always "NDA"
- governingLawJurisdiction: string extracted from the document (e.g. "California", "Delaware", "England and Wales"), or null if not stated
- partyLocations: array of strings — locations of parties mentioned in the document; empty array if not stated
- jurisdictionMismatch: null — do not populate; this is computed separately
- overallRiskScore: integer 0-100, where 0 = perfectly balanced, 100 = ${ctx.scorePerspective}
- overallRiskLabel: concise label
- redFlagCount, unusualCount, contextDependentCount, standardCount: accurate counts matching clause risk levels
- keyDates: array of { label, value, urgency } for dates, deadlines, notice periods (urgency: HIGH/MEDIUM/LOW)
- yourRights: list of ${ctx.rightsLabel}
- yourObligations: list of ${ctx.obligationsLabel}
- missingClauses: For each mandatory clause that is absent from the document, add an entry with \`title\`, \`whyItMatters\`, and \`whatToAskFor\`. Do NOT list missing clauses inside \`clauses[]\` — use \`missingClauses[]\` exclusively for absent items.
- originalExcerpt: MUST be a verbatim substring of the source document. Never paraphrase, smooth, or reword. If an exact quote is impossible, set the field to null rather than fabricating a quote.
- overallRiskScore: Compute strictly from clause analysis. Surface jurisdiction mismatch separately via mismatchSnippet.
- statutoryProtections: array of { name, jurisdiction, summary, overridesClauseId? }. List statutes that give parties rights this NDA cannot override (e.g., DTSA §1833(b) whistleblower immunity, Speak Out Act, SEC Rule 21F-17, state trade-secret law carve-outs). Positive framing — these are protections parties keep regardless of what the NDA says.
- contradictions: array of { description: string, clauseIds: string[] (min 2) }. Scan the entire document for internal contradictions (e.g., one clause defines confidentiality broadly, another carves out exceptions that contradict it). Each contradiction must list the clause IDs involved.

${mismatchSection}

OUTPUT: A single valid JSON object matching the AnalysisResult schema. Include ALL clauses found in the document — do not skip any. Respond with ONLY the JSON object. No markdown, no explanations.`;

  const user = `Analyze this NDA:\n\n${documentText}`;

  return { system, user };
}
