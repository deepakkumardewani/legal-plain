import { describe, it, expect, beforeEach, vi } from "vitest";
import { validPass1Result, sampleAnalysis, sampleDocumentText } from "@/tests/fixtures/analysis";

const validUuid = "550e8400-e29b-41d4-a716-446655440000";

function createMockRedis(allowed = true, remaining = 9) {
  return {
    eval: vi.fn().mockResolvedValue([allowed ? 1 : 0, remaining]),
  };
}

describe("POST /api/analyze", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.ANTHROPIC_API_KEY = "test-key";
    process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
  });

  async function callAnalyze(body: unknown, userId = validUuid, ip = "192.168.1.1") {
    const mockRedis = createMockRedis();

    vi.doMock("@/lib/redis", () => ({
      getRedis: () => mockRedis,
    }));

    vi.doMock("@/lib/anthropic", () => ({
      callClaude: vi
        .fn()
        .mockImplementationOnce(() => Promise.resolve(validPass1Result))
        .mockImplementationOnce(() => Promise.resolve(sampleAnalysis)),
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
      userJurisdiction: null,
      userId: validUuid,
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.documentType).toBe("EMPLOYMENT_CONTRACT");
    expect(data.effectiveJurisdiction).toBeDefined();
    expect(data.followUpQuestionsRemaining).toBe(10);
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
        userJurisdiction: null,
        userId: validUuid,
      },
      "not-a-valid-uuid",
    );

    expect(response.status).toBe(400);
  });

  it("returns 400 for empty document text", async () => {
    const response = await callAnalyze({
      documentText: "",
      userJurisdiction: null,
      userId: validUuid,
    });

    expect(response.status).toBe(400);
  });

  it("returns 400 for oversized document text", async () => {
    const response = await callAnalyze({
      documentText: "x".repeat(150001),
      userJurisdiction: null,
      userId: validUuid,
    });

    expect(response.status).toBe(400);
  });

  it("returns 429 when rate limit exceeded", async () => {
    const mockRedis = createMockRedis(false, 0);
    vi.doMock("@/lib/redis", () => ({
      getRedis: () => mockRedis,
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
        userJurisdiction: null,
        userId: validUuid,
      }),
    });

    const response = await POST(request as unknown as Parameters<typeof POST>[0]);
    expect(response.status).toBe(429);
    const data = await response.json();
    expect(data.remaining).toBe(0);
  });

  it("returns 422 when Pass 1 rejects the document", async () => {
    vi.doMock("@/lib/redis", () => ({
      getRedis: () => createMockRedis(),
    }));

    vi.doMock("@/lib/anthropic", () => ({
      callClaude: vi.fn().mockResolvedValue({
        valid: false,
        reason: "This is not a legal document.",
        documentType: "EMPLOYMENT_CONTRACT",
        governingLawJurisdiction: null,
        partyLocations: [],
        jurisdictionMismatch: false,
        mismatchConfidence: null,
        clauseMap: [],
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
        userJurisdiction: null,
        userId: validUuid,
      }),
    });

    const response = await POST(request as unknown as Parameters<typeof POST>[0]);
    expect(response.status).toBe(422);
    const data = await response.json();
    expect(data.reason).toBeDefined();
  });

  it("floors overallRiskScore at 60 when mismatch confidence is HIGH", async () => {
    const mockRedis = createMockRedis();
    vi.doMock("@/lib/redis", () => ({
      getRedis: () => mockRedis,
    }));

    const lowScoreAnalysis = {
      ...sampleAnalysis,
      overallRiskScore: 35,
    };

    vi.doMock("@/lib/anthropic", () => ({
      callClaude: vi
        .fn()
        .mockImplementationOnce(() => Promise.resolve(validPass1Result))
        .mockImplementationOnce(() => Promise.resolve(lowScoreAnalysis)),
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
        userJurisdiction: null,
        userId: validUuid,
      }),
    });

    const response = await POST(request as unknown as Parameters<typeof POST>[0]);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.overallRiskScore).toBe(60);
  });
});
