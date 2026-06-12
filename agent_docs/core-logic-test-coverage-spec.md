# Spec — Core Logic Test Coverage

> Test-hardening specification. Confirmed via interview on 2026-06-12.
> Companion plan: `core-logic-test-coverage-plan.md`. Task list: `core-logic-test-coverage-tasks.md`.

---

## 1. Objective

Make the app provably well-tested: get the existing suite fully green, then bring **our own deterministic logic** to ~100% meaningful coverage. AI prompt content and model output are explicitly excluded.

### Why now

The suite has drifted out of sync with the code. **14 tests fail** across 5 files, which blocks the coverage report from rendering at all. Source code evolved (schema fields changed, copy/markup changed) but the tests were not updated. We need a trustworthy green suite and a real coverage signal before we can close gaps.

### Guiding constraint

**Current shipping code is the source of truth.** When a test and the code disagree, update the test — only change code if a failure exposes a genuine bug. Do not write contrived tests to chase unreachable lines; prefer explicit `/* v8 ignore */` on genuinely-defensive code.

---

## 2. Scope

### In scope for the 100% coverage target

- **`lib/**` except `lib/prompts/**`** — including:
  - Parsing: [`lib/pdfParser.ts`](../lib/pdfParser.ts)
  - Scoring: [`lib/riskScore.ts`](../lib/riskScore.ts), [`lib/riskBadge.ts`](../lib/riskBadge.ts)
  - Validation: [`lib/schemas.ts`](../lib/schemas.ts), [`lib/sanitize.ts`](../lib/sanitize.ts)
  - State/stores/hooks: [`lib/analysisStore.ts`](../lib/analysisStore.ts), [`lib/useAnalysisStore.ts`](../lib/useAnalysisStore.ts), [`lib/analysisHistory.ts`](../lib/analysisHistory.ts), [`lib/useAnalysisHistory.ts`](../lib/useAnalysisHistory.ts), [`lib/analysisCache.ts`](../lib/analysisCache.ts), [`lib/useUnloadGuard.ts`](../lib/useUnloadGuard.ts)
  - Infra (mocked): [`lib/rateLimit.ts`](../lib/rateLimit.ts), [`lib/redis.ts`](../lib/redis.ts)
  - Export: [`lib/exportMarkdown.ts`](../lib/exportMarkdown.ts), [`lib/exportPdf.ts`](../lib/exportPdf.ts)
  - Utility/data: [`lib/utils.ts`](../lib/utils.ts), [`lib/userId.ts`](../lib/userId.ts), [`lib/jurisdictions.ts`](../lib/jurisdictions.ts), [`lib/apiError.ts`](../lib/apiError.ts)
  - The `callAI` **interface** in [`lib/ai.ts`](../lib/ai.ts): timeout/abort handling, retry, error mapping, response parsing — **not** prompt content or model semantics.
- **API route handlers** — [`app/api/analyze/route.ts`](../app/api/analyze/route.ts), [`app/api/followup/route.ts`](../app/api/followup/route.ts), [`app/api/share/route.ts`](../app/api/share/route.ts), [`app/api/share/[shareId]/route.ts`](../app/api/share/[shareId]/route.ts) — validation, rate-limit branching, error mapping, status codes.

### UI (logic-only, NOT part of the coverage gate)

Behavioral tests on components that contain real logic (conditional rendering, event handlers, state transitions, formatting): RiskDashboard, PdfUpload, HistoryItemCard, AnalyzingGuardBanner, JurisdictionMismatchBanner, etc. `components/**` is **not** added to the coverage `include`. Pure-presentational JSX/styling is not chased.

### Out of scope

- AI prompt strings & model output (`lib/prompts/**`; the *content/quality* of model responses).
- Pure-presentational JSX / styling / className assertions beyond what verifies logic.
- Playwright e2e (`e2e/**`) — keep existing tests passing; not part of the coverage target.
- Constant/type-only modules with no logic: [`lib/types.ts`](../lib/types.ts), [`lib/constants.ts`](../lib/constants.ts), [`lib/fonts.ts`](../lib/fonts.ts) — excluded from coverage `include`.
- New app features.

---

## 3. Acceptance Criteria

**G1. Green suite.** `bun run test` passes with **0 failing tests**.
- *AC:* All 14 current failures resolved by updating stale tests to match current code (schema, PDF copy, banner markup, ai timeout, followup rate-limit).
- *AC:* Any code change made instead of a test change is justified as a real bug in the task notes.

**G2. Coverage config corrected.**
- *AC:* `vitest.config.ts` `coverage.include` covers `lib/**` and `app/api/**`.
- *AC:* `coverage.exclude` lists `lib/prompts/**`, `lib/types.ts`, `lib/constants.ts`, `lib/fonts.ts`, and test/mocks files.
- *AC:* Hard `thresholds` remain at **80%** (lines/branches/functions/statements). 100% is the working target, not the CI gate.

**G3. Meaningful 100% on in-scope code.**
- *AC:* Every in-scope module reports 100% lines/branches/functions in `bun run test:coverage`, **or** the shortfall is a single explicit `/* v8 ignore */`-annotated unreachable defensive branch with a one-line reason.
- *AC:* No module currently lacking a test (`analysisStore`, `apiError`, `jurisdictions`, `redis`, `sanitize`, `useAnalysisStore`, `utils`) remains untested.

**G4. AI boundary respected.**
- *AC:* No test asserts on prompt string content or specific model wording. `lib/ai.ts` tests mock the model and assert only on the interface (timeout, retry, error shape, parsing).

**G5. `bun run verify` passes** (lint, format, type-check) on all new/changed test files.
