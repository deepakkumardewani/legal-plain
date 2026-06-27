import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { captureAnalysisStopped } from "@/lib/analytics";
import { serverError } from "@/lib/apiError";

const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const trackRequestSchema = z.object({
  event: z.literal("analysis_stopped"),
  sessionId: z.string().regex(UUID_V4_RE),
  documentType: z.string().min(1),
});

// Lightweight endpoint for client-side analytics events that can't be
// tracked server-side (e.g. user aborting a request mid-flight).
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: true });

    const parsed = trackRequestSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: true });

    const country = request.headers.get("x-vercel-ip-country") ?? "unknown";

    await captureAnalysisStopped({
      sessionId: parsed.data.sessionId,
      documentType: parsed.data.documentType,
      country,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError("Track error", error);
  }
}
