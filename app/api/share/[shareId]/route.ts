import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getShare } from "@/lib/redis";
import { serverError } from "@/lib/apiError";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> },
): Promise<NextResponse> {
  try {
    const { shareId } = await params;

    if (!shareId || typeof shareId !== "string") {
      return NextResponse.json({ error: "Share ID is required" }, { status: 400 });
    }

    const analysis = await getShare(shareId);

    if (!analysis) {
      return NextResponse.json({ error: "Share not found or expired" }, { status: 404 });
    }

    return NextResponse.json(analysis);
  } catch (error) {
    return serverError("Share retrieval error", error, "Internal server error");
  }
}
