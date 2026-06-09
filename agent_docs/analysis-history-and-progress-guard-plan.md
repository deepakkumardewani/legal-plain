# Plan — Analysis History & In-Progress Guard

> Source spec: `analysis-history-and-progress-guard-spec.md`
> Actionable task list (checkboxes, ACs, verify steps): `analysis-history-and-progress-guard-tasks.md`
>
> This file owns **strategy**: dependency graph, build order, checkpoints, risks. Task-level detail lives in the tasks file.

---

## Dependency Graph

```
Feature B (independent, ship first — smallest, highest safety value)
  B1 useUnloadGuard ──┐
  B2 AnalyzingGuardBanner ──┴─> B3 wire into AnalyzePage

Feature A (history)
  A0 risk-badge SSOT (extract/reuse)
        │
  A1 analysisHistory.ts (IndexedDB CRUD) ──> A2 useAnalysisHistory hook
        │                                          │
  A3 persist-on-complete (AnalyzePage)             │
        │                                          ▼
        └──────────────> A4 /history route + HistoryList + HistoryItemCard
                                  │
                                  ├─> A5 reopen (rehydrate store → /results)
                                  ├─> A6 rename
                                  ├─> A7 delete + clear-all
                                  └─> A8 header entry points
        A9 retention cap lives inside A1 (write path)
```

**Critical path:** A0 → A1 → A2 → A4 → A5. Feature B is fully parallel — no dependency on A.

---

## Build Order & Phases

| Phase | Tasks | Outcome | Checkpoint |
|---|---|---|---|
| 1 — Guard | B1, B2, B3 | Warn + unload guard during analysis | 🟢 shippable alone |
| 2 — Storage | A0, A1, A2 | IndexedDB history layer, unit-proven | 🟡 proven before UI |
| 3 — UI | A3, A4, A5, A6, A7, A8 | Full history usable end-to-end | 🟠 feature-complete |
| 4 — E2E | E1, E2 | Coverage + final verification | 🔵 ship-ready |

Feature B (Phase 1) ships first: it's the smallest slice and delivers the highest immediate safety value (users stop losing in-flight analyses). Storage is unit-proven (Phase 2) before any UI depends on it.

---

## Existing Touch Points

- [`lib/userId.ts`](../lib/userId.ts) — IndexedDB pattern to mirror (A1).
- [`lib/analysisStore.ts`](../lib/analysisStore.ts) / [`lib/useAnalysisStore.ts`](../lib/useAnalysisStore.ts) — `setAnalysis(result, text)` for rehydration (A5).
- [`components/input/AnalyzePage.tsx`](../components/input/AnalyzePage.tsx) — persist on success (A3) + wire guard (B3).
- [`app/results/page.tsx`](../app/results/page.tsx) — reads store; reopen target (A5).
- [`components/analysis/RiskDashboard.tsx`](../components/analysis/RiskDashboard.tsx) — current risk badge logic to extract (A0).
- `AnalyzeHeader.tsx` / `ResultsHeader.tsx` — entry points (A8).

---

## Checkpoints (human/verify gates)

- **🟢 Checkpoint 1** — after Phase 1: Feature B shippable independently; `bun run verify` green; demo banner + unload prompt.
- **🟡 Checkpoint 2** — after Phase 2: storage layer proven by unit tests before any UI consumes it.
- **🟠 Checkpoint 3** — after Phase 3: full history usable end-to-end; unit/component tests green.
- **🔵 Checkpoint 4** — after Phase 4: ship-ready; present demo + verification steps.

---

## Risks & Notes

- **IndexedDB test harness:** confirm whether the repo already shims IndexedDB in `userId` tests; reuse that approach for A1 to stay consistent.
- **Risk-badge extraction (A0):** the one task touching existing user-visible output — verify the dashboard renders pixel-identical after the refactor.
- **Best-effort writes:** A3 must never block the happy path; wrap in try/catch with contextual logging.
- **No server changes:** if any task tempts a server/Redis edit, stop — boundary in spec §7.
