# Plan — Core Logic Test Coverage

> Companion to `core-logic-test-coverage-spec.md`. Task checklist: `core-logic-test-coverage-tasks.md`.

---

## Strategy

Three ordered phases. **Phase 1 must complete before Phase 3** — a failing suite blocks the coverage report, so we cannot measure gaps until the suite is green.

```
Phase 1: Green the suite      → precondition for any coverage signal
Phase 2: Fix coverage config  → exclude prompts/types, add app/api, keep 80% gate
Phase 3: Close coverage gaps  → write tests until in-scope code hits ~100% meaningful
```

---

## Phase 1 — Green the suite (fix 14 stale tests)

Each failure has a known root cause; all are stale tests, fixed by aligning the test to current code.

| Failing file | Root cause | Fix |
|---|---|---|
| `tests/unit/schemas.test.ts` | `analyzeRequestSchema` dropped `userJurisdiction`, now requires `documentType` | Update fixtures: add `documentType`, remove `userJurisdiction`; add a case asserting missing `documentType` fails |
| `tests/unit/PdfUpload.test.tsx` | Copy changed ("Reading your contract…" → "Reading your document…"); drag class changed | Update expected text + drag-over className to current markup |
| `tests/unit/JurisdictionMismatchBanner.test.tsx` (7) | Banner markup/props drifted | Re-read component, realign queries/assertions to current render output |
| `tests/unit/ai.test.ts` > throws on timeout | Abort/timeout handling path changed | Align mock + assertion to current `controller.abort()` / `AbortError` flow |
| `tests/integration/followup.test.ts` > 429 | Rate-limit mock/branch drifted | Align rate-limit mock to current `lib/rateLimit.ts` contract |

**Exit criteria:** `bun run test` → 0 failures.

## Phase 2 — Correct coverage configuration

Edit `vitest.config.ts`:
- `coverage.include`: `["lib/**", "app/api/**"]`
- `coverage.exclude`: `["lib/prompts/**", "lib/types.ts", "lib/constants.ts", "lib/fonts.ts", "tests/**", "**/*.test.*"]`
- Keep `thresholds` at 80 (hard CI gate unchanged).

**Exit criteria:** `bun run test:coverage` renders a table scoped to in-scope code only; prompts excluded.

## Phase 3 — Close coverage gaps

Run coverage, work the report top-down. New test files for the 7 untested modules, then top up partially-covered ones.

**New unit tests required:**
- `lib/utils.ts` — pure helpers (cn/merge, formatters).
- `lib/sanitize.ts` — input sanitization branches.
- `lib/apiError.ts` — error construction/mapping.
- `lib/jurisdictions.ts` — lookup/normalization logic.
- `lib/analysisStore.ts` + `lib/useAnalysisStore.ts` — set/get/clear, subscription, rehydrate.
- `lib/redis.ts` — client construction + get/set/expire paths (mock `ioredis`/`@upstash/redis`).

**API route handler tests** (extend `tests/integration/`):
- Add `app/api/share/[shareId]` GET coverage (currently the thinnest).
- For each route: valid request, invalid body (zod 400), rate-limit 429, downstream error → mapped status. Mock `callAI`, redis, rate-limit.

**Top-ups:** for any in-scope module under 100%, add the missing branch/error-path tests. Annotate genuinely-unreachable defensive lines with `/* v8 ignore next */` + reason instead of contriving a test.

**Exit criteria:** in-scope modules at 100% meaningful coverage; `bun run verify` clean.

---

## Test conventions (match existing suite)

- Vitest + Testing Library + jsdom; files in `tests/unit/` (`*.test.ts[x]`) and `tests/integration/`.
- Reuse `tests/fixtures/analysis.ts`; extend rather than duplicate fixtures.
- Mock externals via existing `tests/mocks/` (`server-only`, `next-server`); add mocks for `ioredis`/redis and `callAI` as needed.
- Mock the model boundary — never assert prompt content (spec G4).
- Use `bun`, never `npm`.

## Risks

- **Hidden real bugs.** A failure may be code, not test. Per spec, fix the code and note it — don't paper over with a weakened assertion.
- **`exportPdf` / `pdfParser` rely on `jspdf` / `pdfjs-dist`.** May need module mocks to hit branches deterministically in jsdom.
- **Hooks with IndexedDB.** Already use `fake-indexeddb`; reuse that setup for store/history coverage.
