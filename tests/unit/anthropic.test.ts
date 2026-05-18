import { describe, it, expect, beforeEach, vi } from "vitest";
import { z } from "zod";

const testSchema = z.object({
  result: z.string(),
  confidence: z.number().min(0).max(1),
});

describe("callClaude", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.ANTHROPIC_API_KEY = "test-key";
  });

  it("returns typed JSON when schema is provided", async () => {
    const mockCreate = vi.fn().mockResolvedValue({
      content: [{ type: "text", text: '{"result":"success","confidence":0.95}' }],
    });

    vi.doMock("@anthropic-ai/sdk", () => ({
      default: vi.fn().mockImplementation(() => ({
        messages: { create: mockCreate },
      })),
    }));

    const { callClaude } = await import("@/lib/anthropic");

    const result = await callClaude({
      system: "You are a test assistant.",
      user: "Say hello",
      schema: testSchema,
    });

    expect(result).toEqual({ result: "success", confidence: 0.95 });
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system: "You are a test assistant.",
        messages: [{ role: "user", content: "Say hello" }],
      }),
    );
  });

  it("returns raw string when no schema provided", async () => {
    const mockCreate = vi.fn().mockResolvedValue({
      content: [{ type: "text", text: "Plain text response" }],
    });

    vi.doMock("@anthropic-ai/sdk", () => ({
      default: vi.fn().mockImplementation(() => ({
        messages: { create: mockCreate },
      })),
    }));

    const { callClaude } = await import("@/lib/anthropic");

    const result = await callClaude({
      system: "You are a test assistant.",
      user: "Say hello",
    });

    expect(result).toBe("Plain text response");
  });

  it("strips JSON code fences before parsing", async () => {
    const mockCreate = vi.fn().mockResolvedValue({
      content: [{ type: "text", text: '```json\n{"result":"fenced","confidence":0.8}\n```' }],
    });

    vi.doMock("@anthropic-ai/sdk", () => ({
      default: vi.fn().mockImplementation(() => ({
        messages: { create: mockCreate },
      })),
    }));

    const { callClaude } = await import("@/lib/anthropic");

    const result = await callClaude({
      system: "You are a test assistant.",
      user: "Give me JSON",
      schema: testSchema,
    });

    expect(result).toEqual({ result: "fenced", confidence: 0.8 });
  });

  it("retries once on schema validation failure", async () => {
    const mockCreate = vi
      .fn()
      .mockResolvedValueOnce({
        content: [{ type: "text", text: '{"bad":"shape"}' }],
      })
      .mockResolvedValueOnce({
        content: [{ type: "text", text: '{"result":"retried","confidence":0.9}' }],
      });

    vi.doMock("@anthropic-ai/sdk", () => ({
      default: vi.fn().mockImplementation(() => ({
        messages: { create: mockCreate },
      })),
    }));

    const { callClaude } = await import("@/lib/anthropic");

    const result = await callClaude({
      system: "You are a test assistant.",
      user: "Give me JSON",
      schema: testSchema,
    });

    expect(result).toEqual({ result: "retried", confidence: 0.9 });
    expect(mockCreate).toHaveBeenCalledTimes(2);
  });

  it("throws AnthropicJsonError after failed retry", async () => {
    const mockCreate = vi.fn().mockResolvedValue({
      content: [{ type: "text", text: '{"bad":"shape"}' }],
    });

    vi.doMock("@anthropic-ai/sdk", () => ({
      default: vi.fn().mockImplementation(() => ({
        messages: { create: mockCreate },
      })),
    }));

    const { callClaude, AnthropicJsonError } = await import("@/lib/anthropic");

    await expect(
      callClaude({
        system: "You are a test assistant.",
        user: "Give me JSON",
        schema: testSchema,
      }),
    ).rejects.toThrow(AnthropicJsonError);

    expect(mockCreate).toHaveBeenCalledTimes(2);
  });

  it("retries on 5xx errors", async () => {
    class MockAPIError extends Error {
      status: number;
      constructor(status: number) {
        super("API Error");
        this.status = status;
      }
    }

    const { default: AnthropicMock } = await import("@anthropic-ai/sdk");
    const _MockAnthropic = AnthropicMock as unknown as new (opts: object) => {
      messages: { create: ReturnType<typeof vi.fn> };
    };

    vi.doMock("@anthropic-ai/sdk", () => ({
      default: vi.fn().mockImplementation(() => ({
        messages: {
          create: vi
            .fn()
            .mockRejectedValueOnce(new MockAPIError(500))
            .mockResolvedValueOnce({
              content: [{ type: "text", text: '{"result":"recovered","confidence":0.7}' }],
            }),
        },
      })),
    }));

    const { callClaude } = await import("@/lib/anthropic");

    const result = await callClaude({
      system: "You are a test assistant.",
      user: "Say hello",
      schema: testSchema,
    });

    expect(result).toEqual({ result: "recovered", confidence: 0.7 });
  });

  it("respects custom maxTokens", async () => {
    const mockCreate = vi.fn().mockResolvedValue({
      content: [{ type: "text", text: "response" }],
    });

    vi.doMock("@anthropic-ai/sdk", () => ({
      default: vi.fn().mockImplementation(() => ({
        messages: { create: mockCreate },
      })),
    }));

    const { callClaude } = await import("@/lib/anthropic");

    await callClaude({
      system: "You are a test assistant.",
      user: "Say hello",
      maxTokens: 1024,
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        max_tokens: 1024,
      }),
    );
  });
});
