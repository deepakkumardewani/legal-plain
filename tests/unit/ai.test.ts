import { describe, it, expect, beforeEach, vi } from "vitest";
import { z } from "zod";

const testSchema = z.object({
  result: z.string(),
  confidence: z.number().min(0).max(1),
});

describe("callAI (DeepSeek)", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.DEEPSEEK_API_KEY = "test-key";
  });

  it("returns typed object when schema is provided", async () => {
    vi.doMock("@ai-sdk/deepseek", () => ({
      createDeepSeek: vi.fn().mockReturnValue(() => "deepseek-chat"),
    }));

    vi.doMock("ai", async () => {
      const actual = await vi.importActual("ai");
      return {
        ...actual,
        generateText: vi.fn().mockResolvedValue({
          output: { result: "success", confidence: 0.95 },
        }),
        Output: {
          object: vi.fn().mockReturnValue({ type: "object-output" }),
        },
      };
    });

    const { callAI } = await import("@/lib/ai");

    const result = await callAI({
      system: "You are a test assistant.",
      user: "Say hello",
      schema: testSchema,
    });

    expect(result).toEqual({ result: "success", confidence: 0.95 });
  });

  it("returns raw string when no schema provided", async () => {
    vi.doMock("@ai-sdk/deepseek", () => ({
      createDeepSeek: vi.fn().mockReturnValue(() => "deepseek-chat"),
    }));

    vi.doMock("ai", async () => {
      const actual = await vi.importActual("ai");
      return {
        ...actual,
        generateText: vi.fn().mockResolvedValue({
          text: "Plain text response",
        }),
      };
    });

    const { callAI } = await import("@/lib/ai");

    const result = await callAI({
      system: "You are a test assistant.",
      user: "Say hello",
    });

    expect(result).toBe("Plain text response");
  });

  it("throws AIError on empty response", async () => {
    vi.doMock("@ai-sdk/deepseek", () => ({
      createDeepSeek: vi.fn().mockReturnValue(() => "deepseek-chat"),
    }));

    vi.doMock("ai", async () => {
      const actual = await vi.importActual("ai");
      return {
        ...actual,
        generateText: vi.fn().mockResolvedValue({
          text: "",
        }),
      };
    });

    const { callAI, AIError } = await import("@/lib/ai");

    await expect(
      callAI({
        system: "You are a test assistant.",
        user: "Say hello",
      }),
    ).rejects.toThrow(AIError);
  });

  it("retries on retryable errors", async () => {
    vi.doMock("@ai-sdk/deepseek", () => ({
      createDeepSeek: vi.fn().mockReturnValue(() => "deepseek-chat"),
    }));

    const mockGenerateText = vi
      .fn()
      .mockRejectedValueOnce(
        Object.assign(new Error("API Error"), {
          statusCode: 500,
          name: "APICallError",
        }),
      )
      .mockResolvedValueOnce({
        output: { result: "recovered", confidence: 0.7 },
      });

    vi.doMock("ai", async () => {
      const actual = await vi.importActual("ai");
      return {
        ...actual,
        generateText: mockGenerateText,
        Output: {
          object: vi.fn().mockReturnValue({ type: "object-output" }),
        },
      };
    });

    const { callAI } = await import("@/lib/ai");

    const result = await callAI({
      system: "You are a test assistant.",
      user: "Say hello",
      schema: testSchema,
    });

    expect(result).toEqual({ result: "recovered", confidence: 0.7 });
  });

  it("respects custom maxTokens", async () => {
    const mockGenerateText = vi.fn().mockResolvedValue({
      text: "response",
    });

    vi.doMock("@ai-sdk/deepseek", () => ({
      createDeepSeek: vi.fn().mockReturnValue(() => "deepseek-chat"),
    }));

    vi.doMock("ai", async () => {
      const actual = await vi.importActual("ai");
      return {
        ...actual,
        generateText: mockGenerateText,
      };
    });

    const { callAI } = await import("@/lib/ai");

    await callAI({
      system: "You are a test assistant.",
      user: "Say hello",
      maxTokens: 1024,
    });

    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        maxOutputTokens: 1024,
      }),
    );
  });

  it("throws on timeout", async () => {
    vi.doMock("@ai-sdk/deepseek", () => ({
      createDeepSeek: vi.fn().mockReturnValue(() => "deepseek-chat"),
    }));

    const abortErr = new Error("The operation was aborted");
    abortErr.name = "AbortError";

    vi.doMock("ai", async () => {
      const actual = await vi.importActual("ai");
      return {
        ...actual,
        generateText: vi.fn().mockRejectedValue(abortErr),
      };
    });

    const { callAI } = await import("@/lib/ai");

    await expect(
      callAI({
        system: "You are a test assistant.",
        user: "Say hello",
      }),
    ).rejects.toThrow("Request timed out after 60 seconds");
  });

  it("throws if DEEPSEEK_API_KEY is missing", async () => {
    delete process.env.DEEPSEEK_API_KEY;
    vi.doMock("@ai-sdk/deepseek", () => ({
      createDeepSeek: vi.fn(),
    }));

    vi.doMock("ai", async () => {
      const actual = await vi.importActual("ai");
      return { ...actual };
    });

    const { callAI } = await import("@/lib/ai");

    await expect(
      callAI({
        system: "You are a test assistant.",
        user: "Say hello",
      }),
    ).rejects.toThrow("DEEPSEEK_API_KEY environment variable is required");
  });
});
