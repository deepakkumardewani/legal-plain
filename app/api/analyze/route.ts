import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { analyzeRequestSchema, analysisResultSchema, pass1ResultSchema } from "@/lib/schemas";
import { checkRateLimit } from "@/lib/rateLimit";
import { getRedis } from "@/lib/redis";
import { callClaude } from "@/lib/anthropic";
import { buildPass1Prompt } from "@/lib/prompts/pass1-detect";
import { getMismatchSnippet } from "@/lib/prompts/jurisdiction-mismatch";
import { getPass2Builder } from "@/lib/prompts/pass2-selector";
import type { AnalysisResult, Pass1Result } from "@/lib/types";

const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "127.0.0.1";
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

    const parsed = analyzeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { documentText, userJurisdiction } = parsed.data;

    const ip = getClientIP(request);

    try {
      const redis = getRedis();
      const rateResult = await checkRateLimit(redis, userId, ip, "analyze");
      if (!rateResult.allowed) {
        return NextResponse.json(
          { error: "Rate limit exceeded", remaining: rateResult.remaining },
          { status: 429 },
        );
      }
    } catch (redisError) {
      // If Redis is unavailable, log and proceed (fail open for dev)
      if (process.env.NODE_ENV === "production") {
        throw redisError;
      }
    }

    // Pass 1: Document detection
    const pass1Prompt = buildPass1Prompt(documentText);
    const pass1Result = await callClaude({
      system: pass1Prompt.system,
      user: pass1Prompt.user,
      maxTokens: 1024,
      schema: pass1ResultSchema,
    });

    const pass1 = pass1Result as Pass1Result;

    if (!pass1.valid) {
      return NextResponse.json(
        {
          error: "Document not supported",
          reason: pass1.reason || "This document type is not supported.",
        },
        { status: 422 },
      );
    }

    // Effective jurisdiction: user override > detected > "unknown"
    const effectiveJurisdiction = userJurisdiction || pass1.governingLawJurisdiction || "unknown";

    // Build mismatch snippet when applicable
    let mismatchSnippet: string | undefined;
    const hasMismatch =
      pass1.jurisdictionMismatch ||
      (pass1.governingLawJurisdiction !== null &&
        pass1.partyLocations.some((loc) => loc !== pass1.governingLawJurisdiction));

    if (hasMismatch && pass1.governingLawJurisdiction && pass1.partyLocations.length > 0) {
      mismatchSnippet = getMismatchSnippet(
        pass1.documentType,
        pass1.governingLawJurisdiction,
        pass1.partyLocations[0],
      );
    }

    // Pass 2: Full analysis
    const pass2Builder = getPass2Builder(pass1.documentType);
    const pass2Prompt = pass2Builder({
      documentText,
      effectiveJurisdiction,
      mismatchSnippet,
      pass1,
    });

    const analysisResult = await callClaude({
      system: pass2Prompt.system,
      user: pass2Prompt.user,
      maxTokens: 8192,
      schema: analysisResultSchema,
    });

    const result = analysisResult as AnalysisResult;

    // Enrich with server-set fields
    result.userJurisdiction = userJurisdiction;
    result.effectiveJurisdiction = effectiveJurisdiction;
    result.followUpQuestionsRemaining = 10;
    result.analyzedAt = new Date().toISOString();

    // Floor risk score on HIGH confidence mismatch
    if (
      pass1.jurisdictionMismatch &&
      pass1.mismatchConfidence === "HIGH" &&
      result.overallRiskScore < 60
    ) {
      result.overallRiskScore = 60;
    }

    return NextResponse.json(result);
  } catch (error) {
    // Structured error logging — never include document text
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
