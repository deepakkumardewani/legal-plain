import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { deleteAnalysisById, deleteAnalysesByIds } from "@/lib/redis";
import { serverError } from "@/lib/apiError";

const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * DELETE /api/history
 * Body: { analysisId: string } — delete one
 *       { analysisIds: string[] } — delete many (used for clear-all)
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (typeof body.analysisId === "string") {
      if (!UUID_V4_RE.test(body.analysisId)) {
        return NextResponse.json({ error: "Invalid analysisId" }, { status: 400 });
      }
      await deleteAnalysisById(body.analysisId);
      return NextResponse.json({ deleted: 1 });
    }

    if (Array.isArray(body.analysisIds)) {
      const ids: string[] = body.analysisIds.filter(
        (id: unknown) => typeof id === "string" && UUID_V4_RE.test(id),
      );
      await deleteAnalysesByIds(ids);
      return NextResponse.json({ deleted: ids.length });
    }

    return NextResponse.json({ error: "Provide analysisId or analysisIds" }, { status: 400 });
  } catch (error) {
    return serverError("History delete error", error);
  }
}
