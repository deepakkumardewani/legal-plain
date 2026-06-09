# Spec — Analysis History & In-Progress Guard

> Feature-scoped specification. Confirmed via interview on 2026-06-09.
> Companion plan: `analysis-history-and-progress-guard-plan.md`.

---

## 1. Objective

Give anonymous users two things they don't have today:

1. **A private, on-device history** of the analyses they've run, so they can browse and reopen prior work.
2. **Protection against losing an in-progress analysis** — a clear warning and an unload guard during the request, so a user doesn't accidentally throw away a 20–40s analysis by leaving the page.

### Target users
Anonymous individuals reviewing their own legal documents (residential lease, NDA, employment) on a single device. No accounts, no login.

### Why now
Analyses are ephemeral. The result lives only in an in-memory module singleton ([`lib/analysisStore.ts`](../lib/analysisStore.ts)); a refresh or any navigation away wipes it. There is no way to revisit a past analysis, and a user who leaves mid-analysis loses everything with no warning.

### Guiding constraint
**Local-only / privacy-preserving.** Nothing new is persisted server-side per user. We reuse the existing anonymous UUID, the in-memory store, and the existing Redis *content-addressed* cache exactly as they are. History lives in the browser (IndexedDB).

---

## 2. Features & Acceptance Criteria

### Feature A — Analysis History (local-only)

**A1. Persist on completion.**
When an analysis completes successfully (in [`AnalyzePage.handleAnalyze`](../components/input/AnalyzePage.tsx)), the **full `AnalysisResult` plus the `documentText`** is written to IndexedDB, keyed by `analysisId`.
- *AC:* After a successful analysis, a record exists in IndexedDB containing the complete result and the document text.
- *AC:* Cache-hit results (which already arrive with a fresh `analysisId`) are persisted the same way — no special-casing.

**A2. History route.**
A new route `/history` lists all stored analyses, newest first.
- *AC:* Visiting `/history` renders every locally stored analysis.
- *AC:* Empty state renders when there are no records (clear copy + CTA to `/analyze`).

**A3. List item content.**
Each item shows an **auto-label** = `{Document Type} · {formatted date}`, a **risk badge** (color derived from `overallRiskScore` / `overallRiskLabel`), and a **short snippet** of the document text.
- *AC:* Label reads e.g. `Residential Lease · Jun 9, 2026`.
- *AC:* Risk badge color/label matches the same mapping used on the results dashboard (single source of truth — reuse, do not re-derive).
- *AC:* Snippet is the first ~80–120 chars of `documentText`, whitespace-collapsed, ellipsized.

**A4. Reopen (no re-analysis).**
Clicking an item rehydrates the in-memory store with the stored result + document text and navigates to `/results`.
- *AC:* Opening a history item makes **zero** network calls to `/api/analyze`.
- *AC:* On the reopened `/results` page, follow-up Q&A and export/share all function (because both result and `documentText` were restored).

**A5. Rename.**
Each item can be given an optional custom label, stored alongside the record. When set, it replaces the auto-label in the list.
- *AC:* Renaming persists across reloads.
- *AC:* Clearing a custom name falls back to the auto-label.

**A6. Delete individual.**
Each item can be deleted.
- *AC:* Deleting removes the record from IndexedDB and the list updates immediately.

**A7. Clear all.**
A single action clears the entire history (with a confirm step).
- *AC:* After confirm, IndexedDB history store is empty and the list shows the empty state.

**A8. Entry point.**
A "History" link is added to the app header(s) so users can reach `/history`.
- *AC:* The link is visible from the analyze/results flow and routes to `/history`.

**A9. Retention cap.**
History is capped at a sensible maximum (default **50** records). When exceeded, the oldest record is evicted on write.
- *AC:* Writing the 51st analysis evicts the oldest; count never exceeds the cap.

### Feature B — In-Progress Guard (warn, not resume)

**B1. In-progress banner.**
While the analyze request is in flight (`loading === true`), a visible, non-dismissible banner warns: *don't close, refresh, or leave this page.*
- *AC:* Banner appears when analysis starts and disappears when the request settles (success or error).

**B2. Unload guard.**
While in flight, a `beforeunload` handler triggers the browser's native confirmation on refresh / tab-close / navigation away.
- *AC:* Attempting to refresh or close the tab mid-analysis prompts the browser confirmation.
- *AC:* The handler is removed when the request settles — no lingering prompt after completion.

**B3. No resume.**
Explicitly **no** background job, no polling, no server-side job state. If the user leaves anyway, the in-memory analysis is lost (server may still finish and populate the content cache, but that is incidental, not a feature).

---

## 3. Tech Stack & Constraints

- **Framework:** Next.js 16 (App Router), React 19, TypeScript — existing stack, no additions.
- **Storage:** Browser **IndexedDB** for the new history store. Follow the existing IndexedDB pattern in [`lib/userId.ts`](../lib/userId.ts) (promise-wrapped, graceful fallback, no third-party wrapper library).
- **State:** Reuse the existing external store ([`lib/analysisStore.ts`](../lib/analysisStore.ts) + [`lib/useAnalysisStore.ts`](../lib/useAnalysisStore.ts)) for rehydration on reopen.
- **No new dependencies.** No `idb`, no state libraries.
- **No server changes** to `/api/analyze` or Redis. The content-addressed cache stays as-is.
- **SSR safety:** All IndexedDB access is browser-only and must guard against server execution (mirror `isBrowser()` in `userId.ts`).

---

## 4. Project Structure (new / touched files)

```
lib/
  analysisHistory.ts        # NEW — IndexedDB CRUD for history records (browser-only)
  useAnalysisHistory.ts     # NEW — hook: list + delete + rename + clearAll, reactive
  riskBadge.ts (or reuse)   # SHARED risk-level → label/color mapping (extract if inline today)

app/
  history/
    page.tsx                # NEW — /history route

components/
  history/
    HistoryList.tsx         # NEW — list container + empty state
    HistoryItemCard.tsx     # NEW — single item: label, badge, snippet, actions
    HistoryItemMenu.tsx     # NEW — rename / delete menu (reuse dropdown-menu ui)
    ClearHistoryButton.tsx  # NEW — clear-all with confirm dialog (reuse dialog ui)
  input/
    AnalyzePage.tsx         # EDIT — persist to history on success; wire guard
    AnalyzeHeader.tsx       # EDIT — add History link
    ResultsHeader.tsx       # EDIT — add History link (if appropriate)
  analysis/
    AnalyzingGuardBanner.tsx# NEW — in-progress banner (Feature B1)

lib/
  useUnloadGuard.ts         # NEW — beforeunload hook (Feature B2)
```

### History record shape
```ts
interface HistoryRecord {
  analysisId: string;        // primary key (from AnalysisResult.analysisId)
  analysis: AnalysisResult;  // full stored result
  documentText: string;      // needed for follow-up + export on reopen
  customName?: string;       // optional rename (A5)
  savedAt: string;           // ISO timestamp for ordering/eviction
}
```

---

## 5. Code Style

Follow the repo + global conventions already in force:
- **DRY:** Risk badge color/label mapping must be a **single source of truth**, shared between the results dashboard and the history list. Extract it if it's currently inline.
- **One responsibility per module/component;** functions under ~30 lines; extract JSX >~20 lines into its own component file.
- **Fail fast / SSR guard:** every IndexedDB entry point checks for a browser environment and degrades gracefully (return `[]` / no-op), mirroring `userId.ts`. Never throw into a render.
- **No silent catches** — log with context on persistence failures (history is best-effort; a failed write must not break the analyze flow).
- **Named constants** for the retention cap, snippet length, DB/store names — no magic numbers.
- **shadcn component rules** for any new UI primitives (reuse existing `dialog`, `dropdown-menu`, `button`).

---

## 6. Testing Strategy

- **Unit (Vitest):** `lib/analysisHistory.ts` CRUD — add, list (ordering), rename, delete, clearAll, retention-cap eviction, and SSR/no-IndexedDB graceful fallback. Mock IndexedDB (fake-indexeddb or a minimal in-memory shim consistent with existing test setup).
- **Unit (Vitest):** risk-badge mapping returns expected label/color per score band.
- **Component (RTL):** `HistoryList` renders items + empty state; `HistoryItemCard` shows auto-label, badge, snippet, and fires rename/delete; reopen handler rehydrates store + routes without calling `/api/analyze`.
- **Unit (Vitest):** `useUnloadGuard` adds/removes the `beforeunload` listener on toggle.
- **E2E (Playwright):** run analysis → see banner → land on results → visit `/history` → item present → reopen (assert no `/api/analyze` request) → rename → delete → clear all → empty state.
- All work must pass `bun run verify` (lint, format check, type-check) and the existing test suites.

---

## 7. Boundaries

**Always**
- Keep history strictly local (IndexedDB); treat writes as best-effort and never let a history failure break analysis.
- Reuse existing store, UUID, Redis cache, and UI primitives unchanged.
- Guard every browser-API access for SSR.

**Ask first**
- Any change that would persist user document text or results server-side.
- Any new dependency.
- Changing the `/api/analyze` contract or the Redis cache behavior.

**Never**
- Add accounts/auth, server-side per-user history, cross-device sync, or background-job/polling resume (explicitly out of scope).
- Add AI-generated titles, history search/filter, calendar export, negotiation checklist, or version compare (deferred; not in this scope).
- Make a network call when reopening a stored analysis.

---

## Out of Scope (deferred)
Server-side history · cross-device sync · true mid-flight resume (background job + polling) · AI-generated titles · history search/filter · key-dates calendar export · negotiation checklist · version compare.
