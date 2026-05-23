import { describe, it, expect, beforeEach, vi } from "vitest";
import { sampleAnalysis, sampleDocumentText } from "@/tests/fixtures/analysis";

const validUuid = "550e8400-e29b-41d4-a716-446655440000";
const analysisId = "660e8400-e29b-41d4-a716-446655440001";

function createMockRedis(allowed = true, remaining = 9) {
  return {
    eval: vi.fn().mockResolvedValue([allowed ? 1 : 0, remaining]),
  };
}

const mockFollowupResponse = {
  answer:
    "Your non-compete clause (clause-1) prevents you from working for competitors in the entire US for 2 years. This is unusually broad.",
  citedClauseIds: ["clause-1"],
};

describe("POST /api/followup", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.DEEPSEEK_API_KEY = "test-key";
    process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
  });

  async function callFollowup(body: unknown, userId = validUuid, ip = "192.168.1.1") {
    const mockRedis = createMockRedis();

    vi.doMock("@/lib/redis", () => ({
      getRedis: () => mockRedis,
    }));

    vi.doMock("@/lib/ai", () => ({
      callAI: vi.fn().mockResolvedValue(mockFollowupResponse),
    }));

    const { POST } = await import("@/app/api/followup/route");

    const request = new Request("http://localhost:3000/api/followup", {
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

  it("returns 200 with answer on success", async () => {
    const response = await callFollowup({
      question: "What does the non-compete mean for me?",
      analysisResult: sampleAnalysis,
      documentText: sampleDocumentText,
      userId: validUuid,
      analysisId,
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.answer).toBeDefined();
    expect(data.answer.length).toBeGreaterThan(0);
    expect(data.citedClauseIds).toEqual(["clause-1"]);
    expect(data.remaining).toBeDefined();
  });

  it("returns 400 when x-user-id header is missing", async () => {
    const { POST } = await import("@/app/api/followup/route");

    const request = new Request("http://localhost:3000/api/followup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        question: "Test question?",
        analysisResult: sampleAnalysis,
        documentText: sampleDocumentText,
        userId: validUuid,
        analysisId,
      }),
    });

    const response = await POST(request as unknown as Parameters<typeof POST>[0]);
    expect(response.status).toBe(400);
  });

  it("returns 400 for empty question", async () => {
    const response = await callFollowup({
      question: "",
      analysisResult: sampleAnalysis,
      documentText: sampleDocumentText,
      userId: validUuid,
      analysisId,
    });

    expect(response.status).toBe(400);
  });

  it("returns 400 for oversized question", async () => {
    const response = await callFollowup({
      question: "x".repeat(501),
      analysisResult: sampleAnalysis,
      documentText: sampleDocumentText,
      userId: validUuid,
      analysisId,
    });

    expect(response.status).toBe(400);
  });

  it("filters unknown clause IDs from citedClauseIds", async () => {
    vi.doMock("@/lib/redis", () => ({
      getRedis: () => createMockRedis(),
    }));

    vi.doMock("@/lib/ai", () => ({
      callAI: vi.fn().mockResolvedValue({
        answer: "Answer with fake clause IDs.",
        citedClauseIds: ["clause-1", "non-existent-id", "also-fake"],
      }),
    }));

    const { POST } = await import("@/app/api/followup/route");

    const request = new Request("http://localhost:3000/api/followup", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-user-id": validUuid,
        "x-forwarded-for": "192.168.1.1",
      },
      body: JSON.stringify({
        question: "Test question?",
        analysisResult: sampleAnalysis,
        documentText: sampleDocumentText,
        userId: validUuid,
        analysisId,
      }),
    });

    const response = await POST(request as unknown as Parameters<typeof POST>[0]);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.citedClauseIds).toEqual(["clause-1"]);
  });

  it("returns 429 when rate limit exceeded", async () => {
    const mockRedis = createMockRedis(false, 0);
    vi.doMock("@/lib/redis", () => ({
      getRedis: () => mockRedis,
    }));

    const { POST } = await import("@/app/api/followup/route");

    const request = new Request("http://localhost:3000/api/followup", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-user-id": validUuid,
        "x-forwarded-for": "192.168.1.1",
      },
      body: JSON.stringify({
        question: "Test question?",
        analysisResult: sampleAnalysis,
        documentText: sampleDocumentText,
        userId: validUuid,
        analysisId,
      }),
    });

    const response = await POST(request as unknown as Parameters<typeof POST>[0]);
    expect(response.status).toBe(429);
    const data = await response.json();
    expect(data.remaining).toBe(0);
  });

  it("returns 400 for invalid userId", async () => {
    const response = await callFollowup(
      {
        question: "Test question?",
        analysisResult: sampleAnalysis,
        documentText: sampleDocumentText,
        userId: validUuid,
        analysisId,
      },
      "not-a-uuid",
    );

    expect(response.status).toBe(400);
  });
});
