# Implementation Plan: LegalPlain v1

## Overview
Build LegalPlain per [SPEC.md](SPEC.md): a zero-account web tool that analyzes pasted/uploaded legal documents (Employment, NDA, Residential Lease) via a 3-pass Claude pipeline, returning a structured plain-English risk analysis with jurisdiction-aware mismatch detection, missing-clause checks, key dates, rights, obligations, follow-up Q&A, and export.

## Architecture Decisions
- **Vertical slicing**: each phase delivers an end-to-end working path (input → analyze → render) rather than building all layers horizontally.
- **Foundations first**: project setup, types, prompts, and the rate-limited API proxy land before any UI is wired.
- **3-pass pipeline is one cohesive unit**: Pass 1 + Pass 2 ship together — splitting them mid-flight produces unverifiable intermediate states.
- **Jurisdiction mismatch is treated as its own slice**, not a side-feature, because it threads through Pass 1, Pass 2, types, scoring, and UI.
- **Anonymous userId before any network call**: generated client-side; never blocks first paint.

---

## Task List

### Phase 0: Foundation

- [x] **Task 1: Project bootstrap & dependency install** ([details](#task-1-project-bootstrap--dependency-install))
- [x] **Task 2: Shared types & Zod schemas** ([details](#task-2-shared-types--zod-schemas))
- [x] **Task 3: Anonymous userId client utility** ([details](#task-3-anonymous-userid-client-utility))
- [x] **Task 4: Rate limit module (Upstash)** ([details](#task-4-rate-limit-module-upstash))

#### Checkpoint: Foundation
- [x] `bun run type-check && bun run lint && bun run format:check` clean
- [x] `bun run test` runs (35 tests passing)
- [x] `bun run dev` boots a blank Next.js 16 page without errors
- [x] `bun run build` succeeds with zero warnings

---

### Phase 1: Analysis Pipeline (server)

- [x] **Task 5: Anthropic client wrapper**
- [x] **Task 6: Prompt modules — Pass 1 + jurisdiction-mismatch snippets**
- [x] **Task 7: Prompt modules — Pass 2 (employment, NDA, lease) + follow-up**
- [x] **Task 8: `/api/analyze` route — full 3-pass flow with rate limiting**
- [x] **Task 9: `/api/followup` route**
- [x] **Task 10: `/api/share` route (Vercel KV, 24hr TTL)**

#### Checkpoint: Pipeline
- [x] Integration tests mock Anthropic and assert full `AnalysisResult` shape
- [x] Rate limiter blocks 11th analysis per userId and 11th follow-up per analysis
- [x] Share link round-trip works; expired share returns 404

---

### Phase 2: Input UI Slice

- [x] **Task 11: Disclaimer gate (session-scoped, non-bypassable)**
- [x] **Task 12: Document input — CodeMirror paste tab**
- [x] **Task 13: PDF upload — pdf.js client-side extraction + scanned-PDF error**
- [x] **Task 14: Jurisdiction selector + Analyze button + 5-stage loading**

#### Checkpoint: Input
- [x] User can: acknowledge disclaimer → paste or upload → submit → see loading stages → reach a stub results page

---

### Phase 3: Results UI Slice

- [x] **Task 15: Risk dashboard header + 4 risk tabs (ClauseCard)**
- [x] **Task 16: Jurisdiction mismatch banner + affected-clause badge + score floor**
- [x] **Task 17: Missing clauses, key dates, rights, obligations panels**
- [x] **Task 18: Follow-up question input (3-question cap)**

#### Checkpoint: Results
- [x] All 4 risk levels render correctly; CONTEXT_DEPENDENT shows gray border + contextNote
- [x] HIGH and LOW confidence mismatch banners render with correct styling
- [x] Follow-up cites specific clauses

---

### Phase 4: Export & Sharing

- [x] **Task 19: Markdown export (native Blob)**
- [x] **Task 20: PDF export (jsPDF) with all sections**
- [x] **Task 21: Share link modal + `/results/[shareId]` page with 24hr expiry copy**

#### Checkpoint: Export
- [x] All three export paths work; share link disclosure shown before copy

---

### Phase 5: Launch Polish

- [ ] **Task 22: Plausible analytics events**
- [ ] **Task 23: Sample documents (NDA, employment, lease) + "Try a sample" buttons**
- [ ] **Task 24: E2E tests (Playwright) — disclaimer → analyze → follow-up → share**
- [ ] **Task 25: Lighthouse pass (≥90 Performance/A11y/Best Practices) + zero console errors**

#### Checkpoint: Launch ready
- [ ] All Success Criteria in SPEC.md ticked
- [ ] Type-check, lint, format, unit, integration, e2e all green

---

## Detailed Task Specs

### Task 1: Project bootstrap & dependency install

**Description:** Scaffold the Next.js 16 + React 19.2 project with TypeScript strict mode, Tailwind, shadcn/ui, Bun as the package manager, oxlint + oxfmt for code quality, Vitest for unit/integration, and Playwright for e2e. Verify the toolchain end-to-end before any feature code is written. No app logic in this task — just a green toolchain and a blank home page.

**Acceptance criteria:**
- [ ] `package.json` declares Next.js 16, React 19.2, TypeScript (strict), Tailwind, shadcn/ui, `@anthropic-ai/sdk`, `@upstash/redis`, `@vercel/kv`, `zod`, `codemirror` 6, `pdfjs-dist`, `jspdf`, `vitest`, `@vitest/coverage-v8`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@playwright/test`, `oxlint`, `oxfmt`
- [ ] `bun install` completes without errors and `bun.lockb` is generated
- [ ] `tsconfig.json` has `"strict": true` and Next.js 16 defaults
- [ ] Tailwind configured with `app/globals.css` and `tailwind.config.ts`
- [ ] shadcn/ui initialized (`components.json` present, `Button` primitive installed as smoke test)
- [ ] `.oxlintrc.json` and `oxfmt.toml` present with sensible defaults
- [ ] `vitest.config.ts` configured (`jsdom` env, `tests/setup.ts`, v8 coverage)
- [ ] `playwright.config.ts` present with a single smoke spec
- [ ] `tests/setup.ts` imports `@testing-library/jest-dom`
- [ ] Scripts in `package.json` exactly match the Commands section of SPEC.md (`dev`, `build`, `start`, `lint`, `lint:fix`, `format`, `format:check`, `type-check`, `test`, `test:watch`, `test:coverage`, `test:e2e`)
- [ ] `.env.local.example` lists `ANTHROPIC_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`
- [ ] `.gitignore` covers `.env.local`, `node_modules`, `.next`, `coverage`, `playwright-report`, `test-results`
- [ ] `app/page.tsx` renders a placeholder "LegalPlain" heading
- [ ] A trivial Vitest test (`tests/unit/smoke.test.ts`) and a trivial Playwright spec (`e2e/smoke.spec.ts`) both pass

**Verification:**
- [ ] `bun install` → exits 0
- [ ] `bun run type-check` → exits 0
- [ ] `bun run lint` → exits 0
- [ ] `bun run format:check` → exits 0
- [ ] `bun run test` → smoke test passes
- [ ] `bun run build` → production build succeeds
- [ ] `bun run dev` → opens at `localhost:3000`, placeholder page renders, zero console errors
- [ ] `bun run test:e2e` → smoke spec passes against the dev build

**Dependencies:** None

**Files likely touched:**
- `package.json`, `bun.lockb`, `tsconfig.json`, `next.config.ts`
- `tailwind.config.ts`, `postcss.config.mjs`, `app/globals.css`
- `components.json`, `components/ui/button.tsx`
- `.oxlintrc.json`, `oxfmt.toml`
- `vitest.config.ts`, `tests/setup.ts`, `tests/unit/smoke.test.ts`
- `playwright.config.ts`, `e2e/smoke.spec.ts`
- `.env.local.example`, `.gitignore`
- `app/layout.tsx`, `app/page.tsx`

**Estimated scope:** Medium (project-wide config)

---

### Task 2: Shared types & Zod schemas

**Description:** Translate the SPEC's `AnalysisResult`, `ClauseAnalysis`, `JurisdictionMismatch`, `MissingClause`, `KeyDate`, `Pass1Result`, and enum types into `lib/types.ts`, with Zod schemas in `lib/schemas.ts` for runtime validation at API boundaries.

**Acceptance criteria:**
- [ ] All types from SPEC §API Response Shape exist verbatim
- [ ] Zod schemas exist for: request bodies (`AnalyzeRequest`, `FollowupRequest`, `ShareRequest`), `Pass1Result`, `AnalysisResult`
- [ ] `z.infer` types match the hand-written TS types (compile-time assertion)
- [ ] No `any` anywhere

**Verification:**
- [ ] `bun run type-check` clean
- [ ] Vitest unit test asserts a known-good JSON parses through the schema and a malformed one fails

**Dependencies:** Task 1
**Files:** `lib/types.ts`, `lib/schemas.ts`, `tests/unit/schemas.test.ts`
**Scope:** Small

---

### Task 3: Anonymous userId client utility

**Description:** Implement `lib/userId.ts` — a UUID v4 generated on first visit, persisted in `localStorage` (key `legalplain_uid`) with `indexedDB` fallback, mirrored to both. Pure client module. No network calls.

**Acceptance criteria:**
- [ ] `getOrCreateUserId(): Promise<string>` returns the same UUID across reloads
- [ ] Reads localStorage first; falls back to indexedDB if missing/corrupted
- [ ] On create, writes to both stores
- [ ] Validates retrieved value is a UUID v4 before returning; regenerates if not
- [ ] SSR-safe (no-op / throws clearly when called server-side)

**Verification:**
- [ ] Vitest tests cover: first call creates, second call reads, corrupted localStorage falls back to indexedDB, malformed UUID is regenerated

**Dependencies:** Task 1
**Files:** `lib/userId.ts`, `tests/unit/userId.test.ts`
**Scope:** Small

---

### Task 4: Rate limit module (Upstash)

**Description:** Implement `lib/rateLimit.ts` per SPEC: per-userId quotas (10 analyses/day, 10 follow-ups/analysis), plus secondary hashed-IP guard (50/day). Sliding 24hr window via Upstash.

**Acceptance criteria:**
- [ ] `checkRateLimit(userId, ip, type, analysisId?)` returns `{ allowed, remaining }`
- [ ] Validates userId is UUID v4; throws on invalid
- [ ] Hashes IP (SHA-256) before using as key
- [ ] Keys match SPEC: `rate:analyze:${userId}`, `rate:followup:${analysisId}:${userId}`, `rate:ipguard:${hashedIP}`
- [ ] Both userId and IP guard must pass; either failure returns `allowed: false`

**Verification:**
- [ ] Vitest integration test with mocked Upstash client covers: allow first 10, block 11th, IP guard blocks at 50, invalid userId throws

**Dependencies:** Task 1, Task 3
**Files:** `lib/rateLimit.ts`, `tests/unit/rateLimit.test.ts`
**Scope:** Small

---

### Task 5: Anthropic client wrapper

**Description:** Implement `lib/anthropic.ts` — a typed wrapper around `@anthropic-ai/sdk` that centralizes model selection (`claude-sonnet-4-6`), retries, timeouts, and JSON-mode parsing. Server-only module — must never be imported from client code.

**Acceptance criteria:**
- [ ] Exports `callClaude({ system, user, maxTokens, schema? })` returning typed JSON when `schema` is provided
- [ ] Reads `ANTHROPIC_API_KEY` from env; throws a clear error if missing at boot
- [ ] Enforces a 60s request timeout; one retry on transient 5xx / network error
- [ ] On JSON parse / schema validation failure: one retry with stricter system instruction, then surfaces a typed `AnthropicJsonError`
- [ ] Module has `import 'server-only'` to prevent client bundling
- [ ] No `console.log`; structured error logging only

**Verification:**
- [ ] Vitest tests with mocked SDK cover: success, transient retry, JSON-validation retry, timeout, missing key
- [ ] Type-check confirms `callClaude<T>` infers the Zod schema's output

**Dependencies:** Task 1, Task 2
**Files:** `lib/anthropic.ts`, `tests/unit/anthropic.test.ts`
**Scope:** Small

---

### Task 6: Prompt modules — Pass 1 + jurisdiction-mismatch snippets

**Description:** Author `lib/prompts/pass1-detect.ts` and `lib/prompts/jurisdiction-mismatch.ts`. Pass 1 detects `documentType`, extracts `governingLawJurisdiction`, `partyLocations`, computes `jurisdictionMismatch` boolean + confidence, and rejects unsupported / non-legal documents with friendly typed errors. The mismatch module provides document-type-specific `whyItMatters` snippets injected into Pass 2.

**Acceptance criteria:**
- [ ] `pass1-detect.ts` exports `buildPass1Prompt(documentText)` returning `{ system, user }`
- [ ] Output is strict JSON matching the `Pass1Result` Zod schema
- [ ] Prompt explicitly instructs: extract governing law clause verbatim, list all party locations separately, set `mismatchConfidence: 'HIGH'` only when an explicit governing law clause exists
- [ ] Prompt rejects non-legal docs with `{ rejected: true, reason: '...' }`
- [ ] `jurisdiction-mismatch.ts` exports `getMismatchSnippet(documentType, governingLaw, partyLocation)` returning a paragraph for employment / NDA / lease
- [ ] All prompt text lives in these modules — never inline in routes
- [ ] No `any`; all return shapes typed

**Verification:**
- [ ] Vitest snapshot test for prompt strings (so drift is visible in PR diffs)
- [ ] Unit test asserts mismatch snippet varies by `documentType`
- [ ] Manual smoke against a real Anthropic call (gated behind `ANTHROPIC_API_KEY` env)

**Dependencies:** Task 2, Task 5
**Files:** `lib/prompts/pass1-detect.ts`, `lib/prompts/jurisdiction-mismatch.ts`, `lib/prompts/index.ts`, `tests/unit/prompts.test.ts`
**Scope:** Medium

---

### Task 7: Prompt modules — Pass 2 (employment, NDA, lease) + follow-up

**Description:** Author `lib/prompts/pass2-employment.ts`, `pass2-nda.ts`, `pass2-lease.ts`, and `followup.ts`. Each Pass 2 prompt analyzes ALL clauses holistically in one call, injects `effectiveJurisdiction` + (optionally) mismatch context, and emits an `AnalysisResult` JSON shape minus server-set fields. Follow-up prompt cites specific clause IDs.

**Acceptance criteria:**
- [ ] Each `buildPass2Prompt({ documentText, effectiveJurisdiction, mismatch, pass1 })` returns `{ system, user }`
- [ ] Prompt enforces: per-clause `riskLevel ∈ {RED, YELLOW, CONTEXT_DEPENDENT, GREEN}`, jurisdiction-aware `riskReason`, `comparisonToStandard`, `obligation`, `negotiationTip` for RED/YELLOW, `contextNote` for CONTEXT_DEPENDENT
- [ ] Prompt enforces mandatory-clause checklist per document type → populates `missingClauses`
- [ ] Prompt sets `affectedByMismatch: true` on clauses whose meaning changes given mismatch
- [ ] `followup.ts` exports `buildFollowupPrompt({ question, analysis, documentText })` — answer must cite clause IDs from the analysis
- [ ] `index.ts` exports `getPass2Builder(documentType)` selector
- [ ] All prompts pass Zod schema validation against test fixtures

**Verification:**
- [ ] Vitest snapshot tests for each prompt
- [ ] Schema-validation tests against canned fixture responses for each document type
- [ ] Test asserts mismatch context appears in prompt only when `mismatch !== null`

**Dependencies:** Task 2, Task 5, Task 6
**Files:** `lib/prompts/pass2-employment.ts`, `lib/prompts/pass2-nda.ts`, `lib/prompts/pass2-lease.ts`, `lib/prompts/followup.ts`, `lib/prompts/index.ts`, `tests/unit/prompts.test.ts`, `tests/fixtures/`
**Scope:** Large

---

### Task 8: `/api/analyze` route — full 3-pass flow with rate limiting

**Description:** Implement `app/api/analyze/route.ts` as the orchestrator: validate request, enforce rate limits, run Pass 1, branch on document type, run Pass 2 with mismatch injection, compute floored risk score, return validated `AnalysisResult`. Server-only.

**Acceptance criteria:**
- [ ] Validates request body with `AnalyzeRequest` Zod schema (text ≤ 150k chars, optional `userJurisdiction`)
- [ ] Requires `x-user-id` header — UUID v4; rejects with 400 otherwise
- [ ] Hashes IP from request; calls `checkRateLimit(userId, ip, 'analyze')`; returns 429 on block with `remaining`
- [ ] Pass 1 → if `rejected`, returns 422 with friendly reason; else builds Pass 2 prompt
- [ ] Computes `effectiveJurisdiction` (user override > detected > "unknown")
- [ ] Injects mismatch snippet when `jurisdictionMismatch.confidence === 'HIGH'` or party/governing-law differ
- [ ] Validates Pass 2 response with `AnalysisResult` schema; one retry with stricter instruction on failure
- [ ] Floors `overallRiskScore` at 60 when mismatch confidence is HIGH
- [ ] Sets `followUpQuestionsRemaining: 10`, `analyzedAt: new Date().toISOString()`
- [ ] Returns `AnalysisResult` JSON; never returns raw model output
- [ ] Logs structured errors (no document text in logs)

**Verification:**
- [ ] Integration test with mocked Anthropic + Upstash covers: success, rate-limit block, oversized text, invalid userId, Pass 1 rejection, Pass 2 schema failure → retry → success, score floor on HIGH mismatch

**Dependencies:** Task 4, Task 5, Task 6, Task 7
**Files:** `app/api/analyze/route.ts`, `tests/integration/analyze.test.ts`
**Scope:** Large

---

### Task 9: `/api/followup` route

**Description:** Implement `app/api/followup/route.ts`. Accepts `{ analysisId, analysis, documentText, question }`, enforces per-analysis follow-up quota, calls Claude with the follow-up prompt, returns a plain-text answer that cites clause IDs.

**Acceptance criteria:**
- [ ] Validates body with `FollowupRequest` Zod schema; question length 1–500 chars
- [ ] Requires `x-user-id` header (UUID v4)
- [ ] Calls `checkRateLimit(userId, ip, 'followup', analysisId)`; returns 429 with `remaining`
- [ ] Sends question + analysis + document text to Claude via `lib/prompts/followup.ts`
- [ ] Response shape: `{ answer: string, citedClauseIds: string[], remaining: number }`
- [ ] Validates `citedClauseIds` exist in supplied analysis; drops unknowns
- [ ] Never persists question, answer, or document

**Verification:**
- [ ] Integration test: success path, 11th call blocked, invalid clause IDs filtered, oversize question rejected
- [ ] Unit test on citation extraction

**Dependencies:** Task 4, Task 5, Task 7
**Files:** `app/api/followup/route.ts`, `tests/integration/followup.test.ts`
**Scope:** Medium

---

### Task 10: `/api/share` route (Vercel KV, 24hr TTL)

**Description:** Implement `app/api/share/route.ts` (POST creates a share record) and `GET /api/share/[shareId]` for retrieval. Stores only analysis JSON in Vercel KV with a 24-hour TTL.

**Acceptance criteria:**
- [ ] POST validates body with `ShareRequest` Zod schema — `analysis: AnalysisResult` only (no document text)
- [ ] Requires `x-user-id`; rejected without it
- [ ] Generates `shareId` via `crypto.randomUUID()`; stores at `share:${shareId}` with `EX 86400`
- [ ] Returns `{ shareId, expiresAt }`
- [ ] GET handler returns `404` cleanly when key missing/expired
- [ ] Refuses to store payloads containing fields outside the `AnalysisResult` schema (strict parse)
- [ ] Never logs the analysis body

**Verification:**
- [ ] Integration test: round-trip create→fetch, expired key 404, schema-strict rejection of extra fields, missing userId rejected
- [ ] Mock KV with in-memory implementation

**Dependencies:** Task 2, Task 3
**Files:** `app/api/share/route.ts`, `app/api/share/[shareId]/route.ts`, `lib/kv.ts`, `tests/integration/share.test.ts`
**Scope:** Small

---

### Task 11: Disclaimer gate (session-scoped, non-bypassable)

**Description:** Build `components/input/DisclaimerGate.tsx`. Modal that blocks the input area until acknowledged. State persists for the browser session only (`sessionStorage`) — reappears on a new tab/session. Cannot be bypassed via URL params or CSS.

**Acceptance criteria:**
- [ ] Renders modal on first mount when `sessionStorage.legalplain_disclaimer !== 'ack'`
- [ ] Modal traps focus; ESC does NOT dismiss; only the "I understand" button does
- [ ] On ack, writes flag and emits `disclaimer_acknowledged` analytics event (stubbed in Phase 2)
- [ ] Underlying input UI is `inert` / `aria-hidden` while modal is open
- [ ] Text matches SPEC disclaimer copy exactly
- [ ] Accessible: labelled by `<h2>`, described by body text, returns focus to triggering element on close

**Verification:**
- [ ] RTL tests: shows on fresh session, hidden after ack, persists within session, reappears in new session
- [ ] axe-playwright a11y check in e2e

**Dependencies:** Task 1
**Files:** `components/input/DisclaimerGate.tsx`, `tests/unit/DisclaimerGate.test.tsx`
**Scope:** Small

---

### Task 12: Document input — CodeMirror paste tab

**Description:** Build `components/input/DocumentInput.tsx` with a tabbed interface (Paste / Upload — upload added in Task 13). The paste tab uses CodeMirror 6 with line numbers off, soft-wrap on, monospace font, and a live character counter.

**Acceptance criteria:**
- [ ] CodeMirror 6 mounted with plaintext extension, soft-wrap, no line numbers
- [ ] Live char count below editor; warning state at ≥ 120k; hard cap with toast at 150k
- [ ] Controlled value via `onChange(text)` prop
- [ ] Tab switcher with `role="tablist"`; keyboard arrow navigation
- [ ] SSR-safe (CodeMirror dynamically imported / mounted in `useEffect`)
- [ ] Empty state: placeholder "Paste your contract here…"

**Verification:**
- [ ] RTL test: typing updates count, 120k warning appears, 150k toast fires
- [ ] No hydration warnings in `bun run dev`

**Dependencies:** Task 1
**Files:** `components/input/DocumentInput.tsx`, `tests/unit/DocumentInput.test.tsx`
**Scope:** Medium

---

### Task 13: PDF upload — pdf.js client-side extraction + scanned-PDF error

**Description:** Build `components/input/PdfUpload.tsx` and `lib/pdfParser.ts`. Drag-and-drop + file picker, extracts text fully client-side, detects scanned-only PDFs (no extractable text) and shows a friendly error directing the user to OCR or paste.

**Acceptance criteria:**
- [ ] Accepts only `application/pdf`; rejects other types with a toast
- [ ] Hard cap at 10 MB; rejects larger with toast
- [ ] Uses `pdfjs-dist` with bundled worker; SSR-safe dynamic import
- [ ] Extracts text from all pages, joins with `\n\n`
- [ ] If extracted text length < 100 chars → "This PDF appears to be scanned. Please paste the text or run OCR first."
- [ ] On success, passes extracted text to parent via `onText(text)`
- [ ] Loading state during extraction; cancellable
- [ ] No upload to the server; no PDF binary leaves the browser

**Verification:**
- [ ] Unit test on `pdfParser.ts` with fixture PDFs (text-based + scanned)
- [ ] RTL test for drag-and-drop, oversize reject, MIME reject

**Dependencies:** Task 1, Task 12
**Files:** `components/input/PdfUpload.tsx`, `lib/pdfParser.ts`, `tests/unit/pdfParser.test.ts`, `tests/fixtures/sample.pdf`, `tests/fixtures/scanned.pdf`
**Scope:** Medium

---

### Task 14: Jurisdiction selector + Analyze button + 5-stage loading

**Description:** Build `JurisdictionSelector.tsx` (optional US-state / country combobox), `AnalyzeButton.tsx` (submit trigger with disabled states), and `LoadingProgress.tsx` (5-stage display per SPEC). Wire everything on `app/page.tsx` so a user can complete the full input flow and reach a stub results page.

**Acceptance criteria:**
- [ ] `JurisdictionSelector`: searchable combobox, all US states + common countries, "Not specified" default, accessible label
- [ ] `AnalyzeButton`: disabled when disclaimer not acked OR input empty OR > 150k chars; loading spinner during request
- [ ] On click: calls `/api/analyze` with `x-user-id` header from `getOrCreateUserId()`
- [ ] `LoadingProgress`: 5 labeled stages, auto-advances on simulated timing while request is in flight; final stage held until response
- [ ] On success: navigates to `/results` (stub) with analysis in client store
- [ ] On 429: shows quota message with remaining + reset hint
- [ ] On 422: shows Pass 1 rejection reason
- [ ] On 5xx: generic retry message; never exposes API key or stack

**Verification:**
- [ ] RTL: button disabled-state matrix, loading-stage advancement
- [ ] Manual smoke: paste → analyze → stub results page

**Dependencies:** Task 3, Task 8, Task 11, Task 12, Task 13
**Files:** `components/input/JurisdictionSelector.tsx`, `components/input/AnalyzeButton.tsx`, `components/input/LoadingProgress.tsx`, `app/page.tsx`, `app/results/page.tsx` (stub), `lib/analysisStore.ts`
**Scope:** Medium

---

### Task 15: Risk dashboard header + 4 risk tabs (ClauseCard)

**Description:** Build `RiskDashboard.tsx` (header with doc type, governing law, score, counts), `CategoryTabs.tsx` (Red/Yellow/Context/Standard with counts), and `ClauseCard.tsx` (per-clause render with badge, plain English, reason, comparison, obligation, negotiation tip, collapsible original text).

**Acceptance criteria:**
- [ ] Header shows `documentType`, `governingLawJurisdiction || "Not specified"`, `overallRiskLabel` + numeric score
- [ ] Counts row: red flags / unusual / context-dependent / standard / missing
- [ ] Tabs: badge color per level (🔴/🟡/⚪/🟢) with counts; keyboard-navigable
- [ ] `ClauseCard`: colored left border per risk level; CONTEXT_DEPENDENT gets gray border + `contextNote`
- [ ] RED/YELLOW cards show `negotiationTip` block
- [ ] "View original text" disclosure renders `originalExcerpt` verbatim, monospace
- [ ] Affected-by-mismatch clauses surface first within their tab (sort)

**Verification:**
- [ ] RTL snapshot per risk level
- [ ] Test: clauses with `affectedByMismatch: true` appear before others
- [ ] axe-playwright clean

**Dependencies:** Task 2, Task 14
**Files:** `components/analysis/RiskDashboard.tsx`, `components/analysis/CategoryTabs.tsx`, `components/analysis/ClauseCard.tsx`, `components/analysis/CompareToStandard.tsx`, `tests/unit/ClauseCard.test.tsx`
**Scope:** Medium

---

### Task 16: Jurisdiction mismatch banner + affected-clause badge + score floor

**Description:** Build `JurisdictionMismatchBanner.tsx` that renders directly under the header when `analysis.jurisdictionMismatch !== null`. HIGH = solid amber + full copy + affected clause count + scroll-to link. LOW = dashed + verification prompt. Also wire the `⚠️ Mismatch affected` badge into `ClauseCard`.

**Acceptance criteria:**
- [ ] Renders nothing when `jurisdictionMismatch === null`
- [ ] HIGH: solid amber, shows `plainEnglish`, `whyItMatters`, `affectedClauseIds.length`, `whatToAskFor`
- [ ] LOW: dashed amber, shorter text, "verify your contract's governing law clause"
- [ ] "N clauses affected" anchors scroll to first affected clause card
- [ ] `ClauseCard` shows badge in top-right when `affectedByMismatch === true`
- [ ] Header reflects the server-applied score floor; banner does not recompute

**Verification:**
- [ ] RTL: null hides banner, HIGH renders amber+solid, LOW renders dashed
- [ ] Test scroll-to via mocked `scrollIntoView`
- [ ] axe-playwright clean

**Dependencies:** Task 15
**Files:** `components/analysis/JurisdictionMismatchBanner.tsx`, `tests/unit/JurisdictionMismatchBanner.test.tsx`
**Scope:** Small

---

### Task 17: Missing clauses, key dates, rights, obligations panels

**Description:** Build `MissingClausesPanel.tsx`, `KeyDatesPanel.tsx`, `YourRightsPanel.tsx`, `ObligationsPanel.tsx`. Each renders only when its source array is non-empty. Key dates color-coded by urgency.

**Acceptance criteria:**
- [ ] `MissingClausesPanel`: list of `{title, whyItMatters, whatToAskFor}`; hidden if empty
- [ ] `KeyDatesPanel`: chronologically sorted; urgency badge (🔴/🟡/🟢); hidden if empty
- [ ] `YourRightsPanel` / `ObligationsPanel`: bulleted; hidden if empty
- [ ] All panels accessible (semantic lists, headings)

**Verification:**
- [ ] RTL per panel: empty hides, populated renders, urgency mapping correct
- [ ] axe-playwright clean

**Dependencies:** Task 15
**Files:** `components/analysis/MissingClausesPanel.tsx`, `components/analysis/KeyDatesPanel.tsx`, `components/analysis/YourRightsPanel.tsx`, `components/analysis/ObligationsPanel.tsx`, `tests/unit/panels.test.tsx`
**Scope:** Small

---

### Task 18: Follow-up question input (3-question cap)

**Description:** Build `FollowUpInput.tsx`. Input + submit posting to `/api/followup`. Shows running remaining count, disables at 0, renders answers with clickable clause-ID citations that scroll to the matching `ClauseCard`.

**Acceptance criteria:**
- [ ] Input disabled when `followUpQuestionsRemaining === 0`
- [ ] Char counter; 500-char hard cap
- [ ] On submit: POST with `x-user-id`; appends answer to local thread on success
- [ ] Decrements remaining from server response
- [ ] Answer markdown rendered safely (no raw HTML); clause-ID tokens become anchor links
- [ ] On 429: shows server `remaining`; surfaces friendly message
- [ ] Empty state: helper text "Ask anything about this contract"

**Verification:**
- [ ] RTL: cap behavior, decrement, citation anchor render, 429 handling
- [ ] Integration with mocked route

**Dependencies:** Task 9, Task 15
**Files:** `components/analysis/FollowUpInput.tsx`, `tests/unit/FollowUpInput.test.tsx`
**Scope:** Medium

---

### Task 19: Markdown export (native Blob)

**Description:** Build `lib/exportMarkdown.ts` and wire into `ExportMenu.tsx`. Generates a full Markdown report (header, mismatch, all clause tabs, missing, dates, rights, obligations) and triggers download via Blob URL.

**Acceptance criteria:**
- [ ] `toMarkdown(analysis: AnalysisResult): string` deterministic output
- [ ] Sections: header, mismatch (if present), each risk category, missing clauses, key dates, rights, obligations, footer with `analyzedAt`
- [ ] Triggers download as `legalplain-analysis-{YYYY-MM-DD}.md`
- [ ] Revokes Blob URL after download
- [ ] No external dependency

**Verification:**
- [ ] Unit test: snapshot of `toMarkdown` against a fixture analysis
- [ ] RTL: click triggers download (mock `URL.createObjectURL`)

**Dependencies:** Task 15, Task 16, Task 17
**Files:** `lib/exportMarkdown.ts`, `components/export/ExportMenu.tsx`, `tests/unit/exportMarkdown.test.ts`
**Scope:** Small

---

### Task 20: PDF export (jsPDF) with all sections

**Description:** Build `lib/exportPdf.ts` using jsPDF. Mirrors Markdown sections in a paginated, readable layout. Wire into `ExportMenu`.

**Acceptance criteria:**
- [ ] `toPdf(analysis): Blob` returns a multi-page PDF
- [ ] Sections match Markdown export; page-break-safe rendering
- [ ] Risk levels color-coded; mismatch banner reproduced
- [ ] Footer: page numbers + "Generated by LegalPlain — not legal advice"
- [ ] File name `legalplain-analysis-{YYYY-MM-DD}.pdf`
- [ ] No embedded raw document text — only the analysis

**Verification:**
- [ ] Unit test: PDF Blob produced, byte length > 0, contains "LegalPlain" string via pdf-parse
- [ ] Manual visual check against fixture

**Dependencies:** Task 19
**Files:** `lib/exportPdf.ts`, `tests/unit/exportPdf.test.ts`
**Scope:** Medium

---

### Task 21: Share link modal + `/results/[shareId]` page with 24hr expiry copy

**Description:** Build `ShareLinkModal.tsx` that POSTs to `/api/share`, shows the URL with copy button, and discloses the 24-hour expiry before copy. Build `app/results/[shareId]/page.tsx` to fetch and render a shared analysis (read-only, no follow-up input).

**Acceptance criteria:**
- [ ] Modal: explicit "This link expires in 24 hours" disclosure shown BEFORE the user can copy
- [ ] Copy button writes URL to clipboard; toast on success/failure
- [ ] `/results/[shareId]/page.tsx` fetches via GET share handler; renders full results UI in read-only mode (no `FollowUpInput`, no share-from-share)
- [ ] 404 page when share expired/missing
- [ ] Read-only mode hides server-state-dependent affordances

**Verification:**
- [ ] RTL: modal copy flow, disclosure shown first
- [ ] Integration: create share → visit page → see analysis → expire → 404

**Dependencies:** Task 10, Task 15, Task 16, Task 17
**Files:** `components/export/ShareLinkModal.tsx`, `app/results/[shareId]/page.tsx`, `app/results/[shareId]/not-found.tsx`, `tests/unit/ShareLinkModal.test.tsx`
**Scope:** Medium

---

### Task 22: Plausible analytics events

**Description:** Add Plausible script to `app/layout.tsx`; emit the four required events with no PII. Centralize in `lib/analytics.ts`.

**Acceptance criteria:**
- [ ] Plausible script loaded with `data-domain` from env
- [ ] `track(event, props?)` helper; events: `disclaimer_acknowledged`, `analysis_completed` (props: `documentType`, `hasMismatch`), `followup_asked`, `export_triggered` (props: `format`)
- [ ] No PII, no document text, no userId in event props
- [ ] No-op in dev / when env var missing

**Verification:**
- [ ] Unit test: `track()` calls `plausible` with right shape; no-op when undefined
- [ ] Manual: events visible in Plausible dashboard during smoke test

**Dependencies:** Task 11, Task 14, Task 18, Task 19
**Files:** `lib/analytics.ts`, `app/layout.tsx`, `tests/unit/analytics.test.ts`
**Scope:** Small

---

### Task 23: Sample documents + "Try a sample" buttons

**Description:** Synthesize three sample documents (NDA, employment, lease) in `public/`. Add three buttons to the input screen that load the sample text into `DocumentInput`.

**Acceptance criteria:**
- [ ] Three files: `public/sample-nda.txt`, `public/sample-employment.txt`, `public/sample-lease.txt`
- [ ] Each ≤ 30k chars, realistic, includes at least one RED flag and one missing clause to exercise the UI
- [ ] Buttons fetch and populate input; do NOT auto-submit
- [ ] Disclaimer-gate-friendly: button click does nothing if disclaimer not acked (shows gate)
- [ ] Footer: "Samples are illustrative only — not real contracts"

**Verification:**
- [ ] RTL: click → input populates; disclaimer-blocked behavior
- [ ] e2e in Task 24 uses one of these

**Dependencies:** Task 11, Task 12
**Files:** `public/sample-*.txt`, `components/input/SampleButtons.tsx`, `app/page.tsx`
**Scope:** Small

---

### Task 24: E2E tests (Playwright) — disclaimer → analyze → follow-up → share

**Description:** Author Playwright specs covering the full happy path and major branches. Mocks `/api/*` routes at the network layer so e2e doesn't burn real Anthropic credits.

**Acceptance criteria:**
- [ ] `analyze-flow.spec.ts`: disclaimer → paste sample → analyze → results render → mismatch banner present
- [ ] `pdf-upload.spec.ts`: upload fixture PDF → results render
- [ ] `followup.spec.ts`: ask 3 questions → 4th disabled
- [ ] `share-link.spec.ts`: create share → visit URL → render read-only → no follow-up input
- [ ] `disclaimer.spec.ts`: gate blocks input until acked; new session re-prompts
- [ ] All specs use `page.route()` mocks for `/api/*`; no live network
- [ ] CI-friendly: runs against `bun run build && bun run start`

**Verification:**
- [ ] `bun run test:e2e` → all specs pass locally and in CI
- [ ] axe-playwright assertion on results page → no serious violations

**Dependencies:** Task 11 through Task 23
**Files:** `e2e/analyze-flow.spec.ts`, `e2e/pdf-upload.spec.ts`, `e2e/followup.spec.ts`, `e2e/share-link.spec.ts`, `e2e/disclaimer.spec.ts`, `e2e/fixtures/`
**Scope:** Large

---

### Task 25: Lighthouse pass + zero console errors

**Description:** Final polish — meet Lighthouse ≥ 90 on Performance, Accessibility, and Best Practices, and eliminate all console output in production builds.

**Acceptance criteria:**
- [ ] Lighthouse (mobile + desktop) ≥ 90 on Performance, Accessibility, Best Practices on `/` and `/results`
- [ ] Zero `console.log` / `console.warn` / `console.error` in production bundle (verified via grep on `.next/`)
- [ ] All images use `next/image`; fonts via `next/font`
- [ ] No layout shift on disclaimer modal mount (CLS < 0.05)
- [ ] CodeMirror and pdf.js dynamically imported (verified via bundle analyzer)
- [ ] All SPEC Success Criteria boxes tickable
- [ ] README updated with deploy instructions and env vars

**Verification:**
- [ ] `bun run build` → no warnings
- [ ] Lighthouse run captured in `agent_docs/lighthouse-report.html`
- [ ] `bun run test && bun run test:e2e && bun run type-check && bun run lint && bun run format:check` all green
- [ ] Manual review: SPEC Success Criteria checklist all ticked

**Dependencies:** All prior tasks
**Files:** `app/layout.tsx`, `next.config.ts`, bundle/image/font polish across the app, `README.md`, `agent_docs/lighthouse-report.html`
**Scope:** Medium

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| oxlint/oxfmt gaps vs ESLint/Prettier (a11y rules) | Med | Add narrow ESLint a11y check in CI if Lighthouse a11y score slips below 90 |
| Next.js 16 + React 19.2 + shadcn compatibility | Med | Verify shadcn `Button` installs cleanly in Task 1 — fail fast |
| Claude Pass 2 token limits on 150k-char docs | High | Enforce 150k cap server-side (Zod) + client warning at 120k |
| Anthropic JSON output drift | High | Validate Pass 2 response with Zod; on failure, retry once with stricter system prompt |
| pdf.js worker setup on Next 16 App Router | Med | Use the bundled worker entry; verify in Task 13 with a real PDF |
| Vercel KV / Upstash quota in dev | Low | Use separate dev tokens; mock in Vitest |

## Open Questions

- Should we keep ESLint as a thin a11y-only layer alongside oxlint, or rely solely on Lighthouse + axe-playwright in e2e? (Defer to Phase 5.)
- Sample document sourcing — synthesize, or use public-domain templates? (Needed by Task 23.)
- Should the userId be rotatable from a UI affordance ("reset session"), or fully invisible? Affects abuse posture.
