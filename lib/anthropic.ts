import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { ZodSchema } from "zod";

const API_KEY = process.env.ANTHROPIC_API_KEY;

function getClient(): Anthropic {
  if (!API_KEY) {
    throw new Error("ANTHROPIC_API_KEY environment variable is required");
  }
  return new Anthropic({ apiKey: API_KEY });
}

let _client: Anthropic | null = null;

function client(): Anthropic {
  if (!_client) {
    _client = getClient();
  }
  return _client;
}

const MODEL = "claude-sonnet-4-6" as const;
const TIMEOUT_MS = 60_000;
const MAX_RETRIES = 1;

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

export class AnthropicJsonError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AnthropicJsonError";
  }
}

interface CallClaudeOptions<T extends ZodSchema> {
  system: string;
  user: string;
  maxTokens?: number;
  schema?: T;
}

async function makeRequest(
  system: string,
  user: string,
  maxTokens: number,
  abortSignal: AbortSignal,
): Promise<string> {
  const response = await client().messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });

  if (abortSignal.aborted) {
    throw new Error("Request aborted after receiving response");
  }

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("");

  if (!text) {
    throw new Error("Empty response from Anthropic");
  }

  return text;
}

function extractJson(text: string): string {
  const trimmed = text.trim();

  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  return trimmed;
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const status = (error as { status?: number }).status;
    if (typeof status === "number" && RETRYABLE_STATUSES.has(status)) {
      return true;
    }
    if (error.name === "APIConnectionError") {
      return true;
    }
  }
  return false;
}

export async function callClaude<T extends ZodSchema>({
  system,
  user,
  maxTokens = 4096,
  schema,
}: CallClaudeOptions<T>): Promise<T extends ZodSchema ? ReturnType<T["parse"]> : string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const text = await makeRequest(system, user, maxTokens, controller.signal);
      clearTimeout(timeout);

      if (!schema) {
        return text as T extends ZodSchema ? ReturnType<T["parse"]> : string;
      }

      const jsonStr = extractJson(text);

      try {
        const parsed = JSON.parse(jsonStr);
        return schema.parse(parsed) as T extends ZodSchema ? ReturnType<T["parse"]> : string;
      } catch (parseError) {
        if (attempt < MAX_RETRIES) {
          system = `${system}\n\nCRITICAL: Your previous response was not valid JSON matching the required schema. You MUST respond with ONLY a valid JSON object and nothing else. Do not include markdown code fences, explanations, or any text outside the JSON.`;
          continue;
        }
        throw new AnthropicJsonError(
          "Failed to parse or validate Claude response as JSON after retry",
          parseError,
        );
      }
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;

      if (error instanceof AnthropicJsonError) {
        throw error;
      }

      if (attempt < MAX_RETRIES && isRetryableError(error)) {
        continue;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timed out after 60 seconds");
      }

      throw error;
    }
  }

  throw lastError;
}
