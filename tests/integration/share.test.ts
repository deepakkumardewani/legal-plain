import { describe, it, expect, beforeEach, vi } from "vitest";
import { sampleAnalysis } from "@/tests/fixtures/analysis";
import { resetKvMock } from "@/tests/mocks/vercel-kv";

const validUuid = "550e8400-e29b-41d4-a716-446655440000";

describe("Share API", () => {
  beforeEach(() => {
    vi.resetModules();
    resetKvMock();
  });

  describe("POST /api/share", () => {
    async function createShare(body: unknown, userId = validUuid) {
      const { POST } = await import("@/app/api/share/route");

      const request = new Request("http://localhost:3000/api/share", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify(body),
      });

      return POST(request as unknown as Parameters<typeof POST>[0]);
    }

    it("returns 200 with shareId and expiresAt on success", async () => {
      const response = await createShare({
        analysisResult: sampleAnalysis,
        userId: validUuid,
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.shareId).toBeDefined();
      expect(typeof data.shareId).toBe("string");
      expect(data.shareId.length).toBeGreaterThan(0);
      expect(data.expiresAt).toBeDefined();
    });

    it("returns 400 when x-user-id header is missing", async () => {
      const { POST } = await import("@/app/api/share/route");

      const request = new Request("http://localhost:3000/api/share", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          analysisResult: sampleAnalysis,
          userId: validUuid,
        }),
      });

      const response = await POST(request as Parameters<typeof POST>[0]);
      expect(response.status).toBe(400);
    });

    it("returns 400 for invalid userId format", async () => {
      const response = await createShare(
        {
          analysisResult: sampleAnalysis,
          userId: validUuid,
        },
        "not-a-uuid",
      );

      expect(response.status).toBe(400);
    });

    it("returns 400 for missing analysisResult", async () => {
      const response = await createShare({
        userId: validUuid,
      });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/share/[shareId]", () => {
    async function getShare(shareId: string) {
      const { GET } = await import("@/app/api/share/[shareId]/route");

      const request = new Request(`http://localhost:3000/api/share/${shareId}`);

      return GET(request as unknown as Parameters<typeof GET>[0], {
        params: Promise.resolve({ shareId }),
      });
    }

    it("returns 404 for non-existent share", async () => {
      const response = await getShare("non-existent-id");
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toContain("not found");
    });

    it("round-trip: create then retrieve share", async () => {
      const { POST } = await import("@/app/api/share/route");
      const { GET } = await import("@/app/api/share/[shareId]/route");

      const createRequest = new Request("http://localhost:3000/api/share", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-user-id": validUuid,
        },
        body: JSON.stringify({
          analysisResult: sampleAnalysis,
          userId: validUuid,
        }),
      });

      const createResponse = await POST(createRequest as Parameters<typeof POST>[0]);
      expect(createResponse.status).toBe(200);
      const { shareId } = await createResponse.json();

      const getRequest = new Request(`http://localhost:3000/api/share/${shareId}`);
      const getResponse = await GET(getRequest as unknown as Parameters<typeof GET>[0], {
        params: Promise.resolve({ shareId }),
      });
      expect(getResponse.status).toBe(200);
      const data = await getResponse.json();
      expect(data.documentType).toBe("EMPLOYMENT_CONTRACT");
      expect(data.clauses.length).toBeGreaterThan(0);
    });
  });
});
