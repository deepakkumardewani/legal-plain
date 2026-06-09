# Tasks — Analysis History & In-Progress Guard

> Source spec: `analysis-history-and-progress-guard-spec.md`
> Strategy/graph/checkpoints: `analysis-history-and-progress-guard-plan.md`
> Track progress by checking boxes. Build top-to-bottom; respect checkpoints.

---

## Phase 1 — In-Progress Guard (Feature B)

### ☑ B1 — `useUnloadGuard` hook
- **File:** `lib/useUnloadGuard.ts` (NEW)
- **Build:** `useUnloadGuard(active: boolean)` — adds `beforeunload` listener when `active`, removes it when false / on unmount.
- **AC:** Listener present only while `active`; cleanly removed otherwise.
- **Verify:** Vitest — toggle `active`, assert `addEventListener`/`removeEventListener` called with `"beforeunload"`.

### ☑ B2 — `AnalyzingGuardBanner` component
- **File:** `components/analysis/AnalyzingGuardBanner.tsx` (NEW)
- **Build:** Non-dismissible warning banner ("Analyzing… please don't close, refresh, or leave this page") styled per DESIGN.md.
- **AC:** Renders warning copy + indicator; no dismiss control.
- **Verify:** RTL — expected copy renders; visual pass against tokens.

### ☑ B3 — Wire guard into AnalyzePage
- **File:** `components/input/AnalyzePage.tsx` (EDIT)
- **Build:** Call `useUnloadGuard(loading)`; render `<AnalyzingGuardBanner />` when `loading`.
- **AC:** Banner shows during analysis, hides on settle; mid-analysis refresh/close prompts native confirm; no prompt after completion.
- **Verify:** Manual (start → attempt refresh → finish). E2E in Phase 4.

> **🟢 Checkpoint 1** — Feature B shippable alone. `bun run verify` green.

---

## Phase 2 — History Storage Foundation

### ☑ A0 — Risk badge single source of truth
- **File:** `lib/riskBadge.ts` (NEW or confirm existing) · `components/analysis/RiskDashboard.tsx` (EDIT if inline)
- **Build:** One shared mapping `overallRiskScore`/`overallRiskLabel` → `{ label, colorClasses }`. Extract from dashboard if inline; refactor dashboard to consume it.
- **AC:** Dashboard renders identically after refactor; mapping importable by history list.
- **Verify:** Vitest — band per score; `bun run verify` green; results page visually unchanged.

### ☑ A1 — `analysisHistory.ts` (IndexedDB CRUD)
- **File:** `lib/analysisHistory.ts` (NEW)
- **Build:** Mirror `lib/userId.ts` IndexedDB pattern. Store `analysis_history`. Funcs: `saveAnalysis`, `listAnalyses` (newest-first), `getAnalysis`, `renameAnalysis`, `deleteAnalysis`, `clearAllAnalyses`. Named constants: DB name, store name, retention cap (50), snippet length. `saveAnalysis` evicts oldest past cap (A9). All entry points SSR-guarded (`[]`/no-op); failures logged, not thrown.
- **Record shape:** `{ analysisId, analysis, documentText, customName?, savedAt }`
- **AC:** Each op works; list ordered `savedAt` desc; 51st write evicts oldest; no-IndexedDB degrades gracefully; write failures logged not thrown.
- **Verify:** Vitest w/ fake-indexeddb (reuse `userId` test approach) — add/list/get/rename/delete/clearAll, cap eviction, SSR fallback.

### ☑ A2 — `useAnalysisHistory` hook
- **File:** `lib/useAnalysisHistory.ts` (NEW)
- **Build:** Reactive list + `rename`, `remove`, `clearAll`, `reload`. Loads on mount (browser only).
- **AC:** Returns current records; mutations update list without manual refresh.
- **Verify:** RTL — probe component reflects seeded records, updates after delete/rename.

> **🟡 Checkpoint 2** — Storage layer unit-proven before any UI consumes it. `bun run verify` green.

---

## Phase 3 — History UI & Reopen

### ☐ A3 — Persist on completion
- **File:** `components/input/AnalyzePage.tsx` (EDIT)
- **Build:** After `setAnalysis(result, documentText)`, call `saveAnalysis({...})` (best-effort, catch+log). Covers fresh + cache-hit results.
- **AC:** Every success → history record with full result + doc text; save failure never blocks `/results` nav.
- **Verify:** Manual + E2E — record appears in `/history`.

### ☐ A4 — `/history` route + list
- **Files:** `app/history/page.tsx` · `components/history/HistoryList.tsx` · `components/history/HistoryItemCard.tsx` (all NEW)
- **Build:** Card = auto-label (`Type · date`) + risk badge (A0) + snippet (A1 constant). Empty state with CTA → `/analyze`. Newest first.
- **AC:** Records render newest-first; empty state when none; badge matches dashboard.
- **Verify:** RTL — list + empty state; manual visual pass.

### ☐ A5 — Reopen (no re-analysis)
- **File:** `components/history/HistoryItemCard.tsx` (EDIT)
- **Build:** Click → `getAnalysis(id)` → `setAnalysis(result, documentText)` → `router.push('/results')`.
- **AC:** Reopen makes **zero** `/api/analyze` calls; results render; follow-up + export work.
- **Verify:** RTL — handler calls store with stored data, no fetch; E2E asserts no `/api/analyze` on reopen.

### ☐ A6 — Rename
- **File:** `components/history/HistoryItemMenu.tsx` (NEW, reuse `dropdown-menu`)
- **Build:** Rename action (inline input or small dialog) → `renameAnalysis`; custom name overrides auto-label; clearing reverts.
- **AC:** Rename persists across reload; empty name reverts to auto-label.
- **Verify:** RTL + manual reload check.

### ☐ A7 — Delete + Clear all
- **Files:** `components/history/HistoryItemMenu.tsx` (EDIT) · `components/history/ClearHistoryButton.tsx` (NEW, reuse `dialog`)
- **Build:** Per-item delete; clear-all with confirm dialog.
- **AC:** Delete removes one, list updates immediately; clear-all (after confirm) → empty state.
- **Verify:** RTL — delete updates list; clear-all confirm path empties list.

### ☐ A8 — Header entry points
- **Files:** `components/input/AnalyzeHeader.tsx` (EDIT) · `components/input/ResultsHeader.tsx` (EDIT if it fits)
- **Build:** "History" link → `/history`.
- **AC:** Link visible in analyze/results flow; routes to `/history`.
- **Verify:** Manual nav; E2E navigates via link.

> **🟠 Checkpoint 3** — Full history feature usable end-to-end. `bun run verify` + unit/component tests green.

---

## Phase 4 — End-to-End & Hardening

### ☐ E1 — Playwright E2E
- **File:** `e2e/` (NEW spec)
- **Build:** analysis → guard banner → results → `/history` shows item → reopen (assert **no** `/api/analyze`) → rename → delete → clear all → empty state.
- **AC:** Full flow passes headless.
- **Verify:** `bun run test:e2e` green.

### ☐ E2 — Final verification pass
- **Build:** `bun run verify` + `bun run test` + `bun run test:e2e`; fix issues; manually re-check every spec AC.
- **AC:** All suites green; every spec AC confirmed.
- **Verify:** Clean run logs.

> **🔵 Checkpoint 4 (final)** — Ship-ready. Demo + verification steps to user.

---

## Commit slices
1. `feat(analyze): warn + unload guard during analysis` — B1–B3
2. `refactor(risk): extract shared risk-badge mapping` — A0
3. `feat(history): local IndexedDB analysis history store` — A1–A2
4. `feat(history): persist analyses on completion` — A3
5. `feat(history): /history list, reopen, rename, delete, clear` — A4–A8
6. `test(history): e2e coverage for history + guard` — E1–E2
