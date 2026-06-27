import "server-only";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { generateText, JSONParseError, Output, TypeValidationError } from "ai";
import type { ZodSchema } from "zod";

const API_KEY = process.env.DEEPSEEK_API_KEY;
const MODEL = process.env.AI_MODEL || "deepseek-v4-flash";
const TIMEOUT_MS = 270_000;
const MAX_RETRIES = 1;
/** DeepSeek max output tokens per API docs */
const MAX_OUTPUT_TOKENS = 384_000;

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

export class AIError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AIError";
  }
}

interface AIOptions<T extends ZodSchema> {
  system: string;
  user: string;
  maxTokens?: number;
  schema?: T;
  label?: string;
  /** Default 0 for structured legal analysis — reduces run-to-run drift. */
  temperature?: number;
}

let _provider: ReturnType<typeof createDeepSeek> | null = null;

function provider(): ReturnType<typeof createDeepSeek> {
  if (!API_KEY) {
    throw new Error("DEEPSEEK_API_KEY environment variable is required");
  }
  if (!_provider) {
    _provider = createDeepSeek({ apiKey: API_KEY });
  }
  return _provider;
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (typeof statusCode === "number" && RETRYABLE_STATUSES.has(statusCode)) {
      return true;
    }
    const cause = (error as { cause?: { status?: number } }).cause;
    if (cause?.status && RETRYABLE_STATUSES.has(cause.status)) {
      return true;
    }
  }
  return false;
}

function isRetryableOutputError(error: unknown): boolean {
  if (error instanceof SyntaxError) return true;
  if (JSONParseError.isInstance(error)) return true;
  if (TypeValidationError.isInstance(error)) return true;
  if (error instanceof AIError && error.message.includes("token limit")) {
    return true;
  }
  return false;
}

function maxTokensForAttempt(base: number, attempt: number): number {
  if (attempt === 0) return Math.min(base, MAX_OUTPUT_TOKENS);
  return MAX_OUTPUT_TOKENS;
}

export async function callAI<T extends ZodSchema>({
  system,
  user,
  maxTokens = 4096,
  schema,
  label = "callAI",
  temperature = 0,
}: AIOptions<T>): Promise<T extends ZodSchema ? ReturnType<T["parse"]> : string> {
  const start = Date.now();
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const attemptMaxTokens = maxTokensForAttempt(maxTokens, attempt);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    if (attempt === 0) {
      console.log(
        `[AI] ${label} → start  model=${MODEL} maxTokens=${attemptMaxTokens} userLen=${user.length}`,
      );
    } else {
      console.log(`[AI] ${label} → retry attempt=${attempt} maxTokens=${attemptMaxTokens}`);
    }

    try {
      if (schema) {
        const result = await generateText({
          model: provider()(MODEL),
          system: `${system}\n\nRespond with valid JSON only. No markdown, no code fences, no explanation.`,
          prompt: user,
          maxOutputTokens: attemptMaxTokens,
          temperature,
          output: Output.object({ schema }),
          abortSignal: controller.signal,
        });

        clearTimeout(timeout);
        console.log(
          `[AI] ${label} → done  elapsed=${Date.now() - start}ms finishReason=${result.finishReason} tokens=${result.totalUsage?.totalTokens ?? "?"}`,
        );

        if (result.finishReason === "length") {
          throw new AIError("Response truncated at token limit");
        }

        if (result.output == null) {
          throw new AIError("Empty structured output from AI");
        }

        console.log(`[AI] ${label} → schema valid ✓`);
        return result.output as T extends ZodSchema ? ReturnType<T["parse"]> : string;
      }

      const result = await generateText({
        model: provider()(MODEL),
        system,
        prompt: user,
        maxOutputTokens: attemptMaxTokens,
        temperature,
        abortSignal: controller.signal,
      });

      clearTimeout(timeout);
      console.log(
        `[AI] ${label} → done  elapsed=${Date.now() - start}ms tokens=${result.usage?.totalTokens ?? "?"}`,
      );

      if (!result.text) {
        throw new AIError("Empty response from AI");
      }

      return result.text as T extends ZodSchema ? ReturnType<T["parse"]> : string;
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;

      if (error instanceof AIError) {
        if (attempt < MAX_RETRIES && isRetryableOutputError(error)) {
          continue;
        }
        throw error;
      }

      if (
        error instanceof Error &&
        (error.name === "AbortError" || error.message?.includes("abort"))
      ) {
        const elapsed = Date.now() - start;
        console.error(`[AI] ${label} → TIMEOUT after ${elapsed}ms`);
        throw new Error(`Request timed out after ${TIMEOUT_MS / 1000} seconds`);
      }

      const e = error as unknown as Record<string, unknown>;
      const errDetail =
        error instanceof Error
          ? {
              message: error.message,
              name: error.name,
              status: e["statusCode"] ?? e["status"],
              cause: e["cause"],
            }
          : error;
      console.error(`[AI] ${label} → error attempt=${attempt}`, JSON.stringify(errDetail, null, 2));

      if (attempt < MAX_RETRIES && (isRetryableError(error) || isRetryableOutputError(error))) {
        continue;
      }

      throw error;
    }
  }

  throw lastError || new AIError("Request failed after retries");
}
