import type { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { analyzeRequestSchema, aiAnalysisResultSchema } from "@/lib/schemas";
import { callAI } from "@/lib/ai";
import { getPass2Builder } from "@/lib/prompts/pass2-selector";
import { buildPass1Prompt } from "@/lib/prompts/pass1-detect";
import { pass1ResultSchema } from "@/lib/schemas";
import type { AnalysisResult } from "@/lib/types";

const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

    const parsed = analyzeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { documentText, documentType } = parsed.data;
    const userRole = (body as { userRole?: string }).userRole as
      | "RECEIVING"
      | "DISCLOSING"
      | "MUTUAL"
      | undefined;

    console.log("[analyze] docType=%s docLen=%d", documentType, documentText.length);

    // Commercial lease gate: run Pass-1 as lightweight pre-check for lease documents
    if (documentType === "RESIDENTIAL_LEASE") {
      const pass1Prompt = buildPass1Prompt(documentText);
      const pass1Result = await callAI({
        system: pass1Prompt.system,
        user: pass1Prompt.user,
        maxTokens: 2048,
        schema: pass1ResultSchema,
        label: "pass1-detect",
      });

      if (pass1Result.subtype === "commercial") {
        return NextResponse.json(
          {
            error: "COMMERCIAL_LEASE_DETECTED",
            message:
              "This looks like a commercial lease. This analyzer is tuned for residential leases only — the tenant protections we'd cite don't apply to commercial tenancies.",
          },
          { status: 422 },
        );
      }
    }

    const pass2Builder = getPass2Builder(documentType);
    const pass2Prompt = pass2Builder({
      documentText,
      effectiveJurisdiction: "unknown",
      userRole: userRole as "RECEIVING" | "DISCLOSING" | "MUTUAL" | undefined,
    });
    console.log(
      "[analyze] systemLen=%d userLen=%d",
      pass2Prompt.system.length,
      pass2Prompt.user.length,
    );

    const analysisResult = await callAI({
      system: pass2Prompt.system,
      user: pass2Prompt.user,
      maxTokens: 131_072,
      schema: aiAnalysisResultSchema,
      label: "pass2-analyze",
    });

    const result = analysisResult as AnalysisResult;

    // Always set fields the AI prompts don't explicitly instruct the AI to produce
    result.documentType = documentType;
    result.governingLawJurisdiction = result.governingLawJurisdiction ?? null;
    result.partyLocations = result.partyLocations ?? [];
    result.jurisdictionMismatch = result.jurisdictionMismatch ?? null;

    result.userJurisdiction = null;
    result.effectiveJurisdiction = "unknown";
    result.followUpQuestionsRemaining = Number.MAX_SAFE_INTEGER;
    result.analysisId = randomUUID();
    result.analyzedAt = new Date().toISOString();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analyze error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      name: error instanceof Error ? error.name : "Unknown",
    });

    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 },
    );
  }
}
