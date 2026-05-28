/** Shared Pass-2 instructions for consistent clause boundaries and scoring. */

export const PASS2_CLAUSE_SEGMENTATION_RULES = `CLAUSE SEGMENTATION (mandatory — follow exactly):
- Create exactly ONE clause per distinct numbered or lettered section in the document (e.g., "1.", "Section 2", "ARTICLE III", "2(a)").
- If the document has no section numbers, use one clause per clearly titled block separated by a heading or a blank line.
- Do NOT merge multiple numbered sections into a single clause.
- Do NOT split one numbered section into multiple clauses unless it has explicit labeled subsections (e.g., 2(a), 2(b)) that each need separate analysis.
- Assign ids sequentially in document order: "clause-1", "clause-2", "clause-3", …
- Every clause in clauses[] MUST have plainEnglish, riskLevel, and riskReason.`;

export const PASS2_SCORE_RUBRIC = `OVERALL RISK SCORE (server recomputes from your clause risk levels — assign riskLevel consistently):
- Per-clause weights: RED = 25, YELLOW = 12, CONTEXT_DEPENDENT = 6, GREEN = 0.
- Formula: round((sum of weights) ÷ (number of clauses × 25) × 100), clamped between 0 and 100.
- Labels: 0–19 "Standard", 20–39 "Low Risk", 40–69 "Moderate Risk", 70–100 "High Risk".
- redFlagCount, unusualCount, contextDependentCount, standardCount MUST equal the number of clauses at each risk level.`;
