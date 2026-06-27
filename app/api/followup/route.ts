import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { followupRequestSchema, followupResponseSchema } from "@/lib/schemas";
import { callAI } from "@/lib/ai";
import { buildFollowupPrompt } from "@/lib/prompts/followup";
import { serverError } from "@/lib/apiError";
import type { AnalysisResult } from "@/lib/types";
import { captureFollowupAsked } from "@/lib/analytics";

const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validClauseIds(analysis: AnalysisResult): Set<string> {
  return new Set(analysis.clauses.map((c) => c.id));
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId || !UUID_V4_RE.test(userId)) {
      return NextResponse.json(
        { error: "Valid x-user-id header (UUID v4) is required" },
        { status: 400 },
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = followupRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { question, analysisResult, documentText } = parsed.data;

    const prompt = buildFollowupPrompt({
      question,
      analysis: analysisResult,
      documentText,
    });

    const response = await callAI({
      system: prompt.system,
      user: prompt.user,
      maxTokens: 2048,
      schema: followupResponseSchema,
    });

    const { answer, citedClauseIds } = response as { answer: string; citedClauseIds: string[] };

    // Validate citedClauseIds exist in the analysis; drop unknowns
    const existingIds = validClauseIds(analysisResult);
    const validIds = citedClauseIds.filter((id) => existingIds.has(id));

    captureFollowupAsked({ sessionId: userId, documentType: analysisResult.documentType, request });
    return NextResponse.json({
      answer,
      citedClauseIds: validIds,
      remaining: Number.MAX_SAFE_INTEGER,
    });
  } catch (error) {
    return serverError("Followup error", error);
  }
}
