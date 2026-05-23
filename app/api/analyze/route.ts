import type { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { analyzeRequestSchema, aiAnalysisResultSchema } from "@/lib/schemas";
import { checkRateLimit } from "@/lib/rateLimit";
import { getRedis } from "@/lib/redis";
import { callAI } from "@/lib/ai";
import { getPass2Builder } from "@/lib/prompts/pass2-selector";
import type { AnalysisResult } from "@/lib/types";

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

    const { documentText, documentType } = parsed.data;
    const ip = getClientIP(request);

    if (process.env.NODE_ENV !== "development") {
      const redis = getRedis();
      const rateResult = await checkRateLimit(redis, userId, ip, "analyze");
      if (!rateResult.allowed) {
        return NextResponse.json(
          { error: "Rate limit exceeded", remaining: rateResult.remaining },
          { status: 429 },
        );
      }
    }

    console.log("[analyze] docType=%s docLen=%d", documentType, documentText.length);

    const pass2Builder = getPass2Builder(documentType);
    const pass2Prompt = pass2Builder({ documentText, effectiveJurisdiction: "unknown" });
    console.log(
      "[analyze] systemLen=%d userLen=%d",
      pass2Prompt.system.length,
      pass2Prompt.user.length,
    );

    const analysisResult = await callAI({
      system: pass2Prompt.system,
      user: pass2Prompt.user,
      maxTokens: 32_768,
      schema: aiAnalysisResultSchema,
      label: "pass2-analyze",
    });

    const result = analysisResult as AnalysisResult;

    result.userJurisdiction = null;
    result.effectiveJurisdiction = "unknown";
    result.followUpQuestionsRemaining = 10;
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
