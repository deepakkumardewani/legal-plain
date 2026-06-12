import { describe, it, expect, beforeEach, vi } from "vitest";
import { computeOverallRiskScore } from "@/lib/riskScore";
import { resetRedisForTesting } from "@/lib/redis";
import { validPass1Result, sampleAnalysis, sampleDocumentText } from "@/tests/fixtures/analysis";

const validUuid = "550e8400-e29b-41d4-a716-446655440000";

describe("POST /api/analyze", () => {
  beforeEach(() => {
    vi.resetModules();
    resetRedisForTesting();
    delete process.env.REDIS_URL;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    process.env.DEEPSEEK_API_KEY = "test-key";
  });

  async function callAnalyze(body: unknown, userId = validUuid, ip = "192.168.1.1") {
    vi.doMock("@/lib/ai", () => ({
      callAI: vi.fn(({ label }: { label?: string }) => {
        if (label === "pass1-detect") return Promise.resolve(validPass1Result);
        return Promise.resolve(sampleAnalysis);
      }),
    }));

    const { POST } = await import("@/app/api/analyze/route");

    const request = new Request("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-user-id": userId,
        "x-forwarded-for": ip,
      },
      body: JSON.stringify(body),
    });

    return POST(request as unknown as Parameters<typeof POST>[0]);
  }

  it("returns 200 with analysis result on success", async () => {
    const response = await callAnalyze({
      documentText: sampleDocumentText,
      documentType: "EMPLOYMENT_CONTRACT",
      userId: validUuid,
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.documentType).toBe("EMPLOYMENT_CONTRACT");
    expect(data.effectiveJurisdiction).toBeDefined();
    expect(data.followUpQuestionsRemaining).toBeGreaterThan(0);
    expect(data.analysisId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(data.analyzedAt).toBeDefined();
    expect(data.clauses.length).toBeGreaterThan(0);
  });

  it("returns 400 when x-user-id header is missing", async () => {
    const { POST } = await import("@/app/api/analyze/route");

    const request = new Request("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        documentText: sampleDocumentText,
        userJurisdiction: null,
      }),
    });

    const response = await POST(request as unknown as Parameters<typeof POST>[0]);
    expect(response.status).toBe(400);
  });

  it("returns 400 for invalid userId format", async () => {
    const response = await callAnalyze(
      {
        documentText: sampleDocumentText,
        documentType: "EMPLOYMENT_CONTRACT",
        userId: validUuid,
      },
      "not-a-valid-uuid",
    );

    expect(response.status).toBe(400);
  });

  it("returns 400 for empty document text", async () => {
    const response = await callAnalyze({
      documentText: "",
      documentType: "EMPLOYMENT_CONTRACT",
      userId: validUuid,
    });

    expect(response.status).toBe(400);
  });

  it("returns 400 for oversized document text", async () => {
    const response = await callAnalyze({
      documentText: "x".repeat(150001),
      documentType: "EMPLOYMENT_CONTRACT",
      userId: validUuid,
    });

    expect(response.status).toBe(400);
  });

  it("returns 422 when Pass 1 rejects the document", async () => {
    vi.doMock("@/lib/ai", () => ({
      callAI: vi.fn().mockResolvedValue({
        ...validPass1Result,
        subtype: "commercial",
      }),
    }));

    const { POST } = await import("@/app/api/analyze/route");

    const request = new Request("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-user-id": validUuid,
        "x-forwarded-for": "192.168.1.1",
      },
      body: JSON.stringify({
        documentText: "This is not a contract.",
        documentType: "RESIDENTIAL_LEASE",
        userId: validUuid,
      }),
    });

    const response = await POST(request as unknown as Parameters<typeof POST>[0]);
    expect(response.status).toBe(422);
    const data = await response.json();
    expect(data.error).toBe("COMMERCIAL_LEASE_DETECTED");
  });

  it("recomputes overallRiskScore from clause risk levels", async () => {
    const lowScoreAnalysis = {
      ...sampleAnalysis,
      overallRiskScore: 35,
    };

    vi.doMock("@/lib/ai", () => ({
      callAI: vi.fn(({ label }: { label?: string }) => {
        if (label === "pass1-detect") return Promise.resolve(validPass1Result);
        return Promise.resolve(lowScoreAnalysis);
      }),
    }));

    const { POST } = await import("@/app/api/analyze/route");

    const request = new Request("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-user-id": validUuid,
        "x-forwarded-for": "192.168.1.1",
      },
      body: JSON.stringify({
        documentText: sampleDocumentText,
        documentType: "EMPLOYMENT_CONTRACT",
        userId: validUuid,
      }),
    });

    const response = await POST(request as unknown as Parameters<typeof POST>[0]);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.overallRiskScore).toBe(computeOverallRiskScore(sampleAnalysis.clauses));
  });

  it("returns 500 when callAI throws", async () => {
    vi.doMock("@/lib/ai", () => ({
      callAI: vi.fn().mockRejectedValue(new Error("AI service down")),
    }));

    const { POST } = await import("@/app/api/analyze/route");

    const request = new Request("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-user-id": validUuid,
        "x-forwarded-for": "192.168.1.1",
      },
      body: JSON.stringify({
        documentText: sampleDocumentText,
        documentType: "EMPLOYMENT_CONTRACT",
        userId: validUuid,
      }),
    });

    const response = await POST(request as unknown as Parameters<typeof POST>[0]);
    expect(response.status).toBe(500);
  });

  it("returns 400 for invalid JSON body", async () => {
    const { POST } = await import("@/app/api/analyze/route");

    const request = new Request("http://localhost:3000/api/analyze", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-user-id": validUuid,
        "x-forwarded-for": "192.168.1.1",
      },
      body: "not valid json",
    });

    const response = await POST(request as unknown as Parameters<typeof POST>[0]);
    expect(response.status).toBe(400);
  });
});
