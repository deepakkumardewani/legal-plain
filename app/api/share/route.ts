import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { shareRequestSchema, analysisResultSchema } from "@/lib/schemas";
import { saveShare } from "@/lib/redis";
import { serverError } from "@/lib/apiError";
import { captureShareCreated } from "@/lib/analytics";

const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHARE_TTL_SECONDS = 86400;

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

    const parsed = shareRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { analysisResult } = parsed.data;

    // Strict parse: ensure no extra fields beyond AnalysisResult
    const strictParsed = analysisResultSchema.safeParse(analysisResult);
    if (!strictParsed.success) {
      return NextResponse.json({ error: "Invalid analysis result structure" }, { status: 400 });
    }

    const shareId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SHARE_TTL_SECONDS * 1000).toISOString();

    await saveShare(shareId, strictParsed.data);

    captureShareCreated({
      sessionId: userId,
      documentType: strictParsed.data.documentType,
      request,
    });
    return NextResponse.json({ shareId, expiresAt });
  } catch (error) {
    return serverError("Share error", error);
  }
}
