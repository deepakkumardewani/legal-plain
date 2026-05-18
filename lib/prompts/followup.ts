import type { AnalysisResult } from "@/lib/types";

interface FollowupPromptInput {
  question: string;
  analysis: AnalysisResult;
  documentText: string;
}

interface FollowupPrompt {
  system: string;
  user: string;
}

export function buildFollowupPrompt({
  question,
  analysis,
  documentText,
}: FollowupPromptInput): FollowupPrompt {
  const clauseRefs = analysis.clauses
    .map((c) => `[${c.id}] ${c.title}: ${c.plainEnglish}`)
    .join("\n");

  const system = `You are a legal analysis assistant helping a user understand a document they had analyzed. Answer their follow-up question in plain English. You MUST cite specific clause IDs from the analysis when relevant.

RULES:
- Answer in plain, accessible English — no legalese
- Cite clause IDs when your answer relates to specific clauses (e.g., "As noted in clause-3, your non-compete...")
- If the question asks about something not covered in the document or analysis, say so clearly
- Keep answers concise but thorough
- Never give legal advice — frame as "the document says" or "the analysis indicates"
- If the question is outside the scope of the document, redirect to the document content

Available clauses from the analysis:
${clauseRefs}

Document type: ${analysis.documentType}
Effective jurisdiction: ${analysis.effectiveJurisdiction}
Overall risk: ${analysis.overallRiskLabel} (${analysis.overallRiskScore}/100)

OUTPUT: A JSON object with:
{
  "answer": "Your plain-English answer here, referencing clause IDs inline like [clause-3]",
  "citedClauseIds": ["clause-3", "clause-5"]
}

Only include citedClauseIds that you actually reference in your answer. Respond with ONLY the JSON object. No markdown, no explanations.`;

  const user = `Question: ${question}

Full document text for reference:
${documentText}

Full analysis JSON:
${JSON.stringify(analysis, null, 2)}`;

  return { system, user };
}
