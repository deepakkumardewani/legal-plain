# Implementation Plan: Local Redis + DeepSeek AI Provider

## Overview

Two independent infrastructure changes:
1. **Local Redis** — swap `@upstash/redis` (REST-based, requires network) for `ioredis` in local development. Production stays on Upstash. Controlled by `NODE_ENV`.
2. **DeepSeek AI** — replace `@anthropic-ai/sdk` with `@ai-sdk/deepseek` + `generateText` from the `ai` package. `DEEPSEEK_API_KEY` is already in `.env`. Keep the same `callClaude` export signature so route handlers need only import path updates.

## Architecture Decisions

- **Shared `RedisClient` interface** defined in `lib/redis.ts` covering only the methods actually used (`eval`). Both the Upstash adapter and the ioredis adapter implement it. `rateLimit.ts` imports this interface instead of `@upstash/redis`'s `Redis` type — no Upstash types leak into consumers.
- **Keep `callClaude` signature unchanged** so `app/api/analyze/route.ts` and `app/api/followup/route.ts` only need their import path updated (one line each).
- **New file `lib/ai.ts`** replaces `lib/anthropic.ts`. The old file is deleted and the Anthropic SDK package removed.

---

## Phase 1: Local Redis in Development

### Task 1: Define shared `RedisClient` interface

**Description:** Add a `RedisClient` interface to `lib/redis.ts` that covers only what `rateLimit.ts` uses — the `eval(script, keys, args)` method (Upstash's calling convention). Update `getRedis()` return type to `RedisClient` instead of Upstash's `Redis`.

**Acceptance criteria:**
- [x] `RedisClient` interface exported from `lib/redis.ts` with `eval(script: string, keys: string[], args: unknown[]): Promise<unknown>`
- [x] `getRedis()` return type is `RedisClient`
- [x] No `@upstash/redis` types imported outside of `lib/redis.ts`

**Verification:**
- [x] `bun run build` passes with no type errors

**Dependencies:** None

**Files likely touched:**
- `lib/redis.ts`

**Estimated scope:** XS

---

### Task 2: Implement ioredis local adapter

**Description:** Install `ioredis`. Create an `IoRedisAdapter` class inside `lib/redis.ts` that wraps an ioredis `Redis` instance and implements `RedisClient`. The adapter translates the Upstash-style `eval(script, keys, args)` call into ioredis's `eval(script, numkeys, ...keys, ...args)` form.

**Acceptance criteria:**
- [x] `ioredis` added as a dependency (`bun add ioredis`)
- [x] `IoRedisAdapter` implements `RedisClient`
- [x] `eval` translation: `redis.eval(script, keys.length, ...keys, ...args.map(String))`
- [x] Adapter reads `REDIS_URL` env var (defaults to `redis://localhost:6379`)

**Verification:**
- [x] `bun run build` passes
- [x] TypeScript reports no errors in `lib/redis.ts`

**Dependencies:** Task 1

**Files likely touched:**
- `lib/redis.ts`

**Estimated scope:** S

---

### Task 3: Branch `getRedis()` by environment

**Description:** Update `getRedis()` to return an `IoRedisAdapter` when `NODE_ENV === "development"`, and the existing Upstash client otherwise. The Upstash instantiation stays unchanged for production.

**Acceptance criteria:**
- [x] `NODE_ENV === "development"` → returns ioredis-backed `RedisClient`
- [x] Any other `NODE_ENV` → returns Upstash-backed `RedisClient`
- [x] Singleton pattern preserved for both paths
- [x] Missing `REDIS_URL` in dev logs a clear error (not a cryptic connection failure)

**Verification:**
- [x] `bun run build` passes
- [x] `bun run dev` — hitting `/api/analyze` no longer requires Upstash env vars

**Dependencies:** Task 2

**Files likely touched:**
- `lib/redis.ts`

**Estimated scope:** S

---

### Task 4: Update `rateLimit.ts` to use `RedisClient` interface

**Description:** Replace `import type { Redis } from "@upstash/redis"` in `lib/rateLimit.ts` with `import type { RedisClient } from "@/lib/redis"`. Update `checkRateLimit` / `checkKeyLimit` signatures. No logic changes.

**Acceptance criteria:**
- [x] `rateLimit.ts` imports zero types from `@upstash/redis`
- [x] `checkRateLimit(redis: RedisClient, ...)` compiles cleanly
- [x] `checkKeyLimit(redis: RedisClient, ...)` compiles cleanly

**Verification:**
- [x] `bun run build` passes with no type errors

**Dependencies:** Task 1

**Files likely touched:**
- `lib/rateLimit.ts`

**Estimated scope:** XS

---

### Task 5: Update `.env` with local Redis URL

**Description:** Add `REDIS_URL=redis://localhost:6379` to `.env`. Upstash vars stay in place for production deploys.

**Acceptance criteria:**
- [x] `.env` contains `REDIS_URL=redis://localhost:6379`
- [x] Upstash vars remain (needed for production)

**Verification:**
- [x] `bun run dev` — rate limiting works without hitting Upstash

**Dependencies:** Task 3

**Files likely touched:**
- `.env`

**Estimated scope:** XS

---

### Checkpoint: Phase 1 Complete

- [x] `bun run build` — clean
- [x] `bun run dev` — `/api/analyze` and `/api/followup` work with local Redis (no Upstash env vars required)
- [x] `grep -r "@upstash/redis" lib/ app/` — only `lib/redis.ts` matches

---

## Phase 2: DeepSeek AI Provider

### Task 6: Install AI SDK packages

**Description:** Add `@ai-sdk/deepseek` and `ai` to the project.

**Acceptance criteria:**
- [x] `bun add @ai-sdk/deepseek ai` succeeds
- [x] Both packages appear in `package.json` dependencies

**Verification:**
- [x] `bun run build` passes

**Dependencies:** None (parallel-safe with Phase 1)

**Files likely touched:**
- `package.json`, `bun.lockb`

**Estimated scope:** XS

---

### Task 7: Implement `lib/ai.ts` with DeepSeek

**Description:** Create `lib/ai.ts` that exports `callClaude` with the **exact same signature** as `lib/anthropic.ts`, implemented via `createDeepSeek` + `generateText`. For structured output (when `schema` is provided), use `Output.object({ schema })` — the AI SDK handles JSON extraction natively. For plain-text output, return `text`. Keep the 60-second `AbortController` timeout and 1-retry logic for 429/5xx. Also export `AnthropicJsonError` (as a named alias) for backward compat.

**Acceptance criteria:**
- [x] `callClaude({ system, user, maxTokens, schema })` exported from `lib/ai.ts`
- [x] Uses `createDeepSeek({ apiKey: process.env.DEEPSEEK_API_KEY })`
- [x] Model constant: `"deepseek-chat"` (override via `AI_MODEL` env var)
- [x] Structured output path: `Output.object({ schema })` from `ai` package — no manual JSON parsing
- [x] Plain-text path: returns `text` string from `generateText` result
- [x] 60-second abort timeout preserved
- [x] Throws a clear error if `DEEPSEEK_API_KEY` is missing
- [x] `AnthropicJsonError` exported (type alias of the new error class)

**Verification:**
- [x] `bun run build` — no TS errors in `lib/ai.ts`

**Dependencies:** Task 6

**Files likely touched:**
- `lib/ai.ts` (new file)

**Estimated scope:** M

---

### Task 8: Update route imports to `lib/ai.ts`

**Description:** In both route files, change the single import line from `@/lib/anthropic` to `@/lib/ai`. No other changes needed.

**Acceptance criteria:**
- [x] `import { callClaude } from "@/lib/ai"` in both route files
- [x] No remaining references to `@/lib/anthropic` in `app/`

**Verification:**
- [x] `bun run build` passes
- [x] `grep -r "lib/anthropic" app/` returns no results

**Dependencies:** Task 7

**Files likely touched:**
- `app/api/analyze/route.ts`
- `app/api/followup/route.ts`

**Estimated scope:** XS

---

### Task 9: Delete `lib/anthropic.ts` and remove Anthropic SDK

**Description:** Delete `lib/anthropic.ts`. Run `bun remove @anthropic-ai/sdk`. Comment out `ANTHROPIC_API_KEY` in `.env` with a note it is no longer used.

**Acceptance criteria:**
- [x] `lib/anthropic.ts` deleted
- [x] `@anthropic-ai/sdk` removed from `package.json`
- [x] `ANTHROPIC_API_KEY` commented out in `.env`
- [x] `bun run build` passes

**Verification:**
- [x] `grep -r "@anthropic-ai/sdk" . --exclude-dir=node_modules` returns no results
- [x] `grep -r "lib/anthropic" . --exclude-dir=node_modules` returns no results

**Dependencies:** Task 8

**Files likely touched:**
- `lib/anthropic.ts` (deleted)
- `package.json`
- `.env`

**Estimated scope:** XS

---

### Checkpoint: Phase 2 Complete

- [x] `bun run build` — clean
- [x] `bun run dev` — document analysis returns valid structured results (pass 1 + pass 2) via DeepSeek
- [x] `bun run dev` — follow-up questions return valid answers
- [x] No references to `@anthropic-ai/sdk` anywhere outside `node_modules`

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| ioredis `eval` arg encoding differs from Upstash | High | Adapter maps args to strings explicitly; test sliding window script against local Redis before merging |
| DeepSeek `Output.object` may not support all Zod types in `schemas.ts` | High | Review `pass1ResultSchema` and `analysisResultSchema` for unsupported constructs before Task 7 |
| `deepseek-chat` may truncate pass 2 at 8192 max tokens | Medium | Monitor response completeness; fall back to `deepseek-reasoner` if analysis is cut short |
| Rate limiting silently bypassed in dev (existing fail-open) | Low | Existing behavior — acceptable for local development |

## Open Questions

- Should `lib/kv.ts` (`@vercel/kv` for share links) also migrate to ioredis locally? It uses a different key namespace and TTL semantics. Not in scope here — raise separately.
- Preferred DeepSeek model: `deepseek-chat` (fast/cheap) or `deepseek-reasoner` (better multi-step reasoning for legal)? Plan defaults to `deepseek-chat`, overridable via `AI_MODEL` env var.
