# Implementation Plan: Results Page Redesign + Q/A Clause Navigation

## Overview

The `/results` page never adopted the product's warm design language used on the landing and
analyse pages (DESIGN.md: `#fbf8f1` bg, `#c8791a` accent, Bricolage display + Barlow body fonts,
`ap-rise` entrance animation). It still uses generic gray/blue/red Tailwind defaults. Two UX bugs
make it worse: (1) clicking a `[clause-16]` reference in a Q/A answer only scrolls when that clause
happens to be in the open tab — clause cards are rendered per active tab only, so cross-tab targets
resolve to `null`; (2) clause cards never show their id/number, so a reference can't be matched to a
card. This plan delivers a full visual overhaul, a single reliable tab-aware clause navigation
system (switch tab → scroll → flash), title+number clause chips, and a chat-style Q/A redesign.

Full design notes: `~/.claude/plans/1-i-need-to-glistening-pie.md`.

## Architecture Decisions

- **Single clause-navigation context** (`ClauseNavigationContext`) owns `activeTab` and a
  `goToClause(id)` that switches to the clause's tab, then scrolls + flashes after re-render. This
  replaces the fragile `getElementById(...).scrollIntoView` logic duplicated in 4 components and is
  the root-cause fix for the intermittent scroll. Chosen over lifting state into the page because
  multiple sibling panels need to trigger navigation.
- **Derived clause number** (`clauseNumber(id)` in `lib/utils.ts`) is the single source of truth so
  the card badge and the Q/A chip always agree.
- **Inline hex + font CSS vars** matching `components/landing/*`, not theme-token edits — the warm
  palette is applied inline across the app, so we stay consistent rather than rewriting globals
  theme tokens. No changes to `lib/types.ts` (no data/shape changes).

## Task List

### Phase 1: Navigation foundation (root-cause scroll fix)

- [x] **Task 1 — Clause navigation context** (S)
  **Description:** New `components/analysis/ClauseNavigationContext.tsx`. Provider takes
  `clauses: ClauseAnalysis[]`, builds `idToLevel: Map<string, RiskLevel>` and `idToClause` map.
  Holds `activeTab`, `pendingScrollId`, `flashId`. Exposes `goToClause(id)` (set tab → set pending),
  `goToTab(level)`, `activeTab`/`setActiveTab`, `flashId`, `idToClause`. An effect on
  `[activeTab, pendingScrollId]` scrolls to `#clause-<id>` (`smooth`, `block:center`), sets
  `flashId`, clears pending, clears flash after ~1.6s. Export `useClauseNav()`.
  **Acceptance criteria:**
  - [x] `goToClause(id)` sets `activeTab` to the clause's level and triggers a scroll after render
  - [x] `flashId` is set on arrival and auto-clears
  - [ ] No `getElementById` calls remain outside this file after Phase 2
  **Verification:**
  - [x] Typecheck passes; provider renders without runtime error
  **Dependencies:** None
  **Files:** `components/analysis/ClauseNavigationContext.tsx`
  **Scope:** Small

- [x] **Task 2 — Flash keyframe + clause number helper** (XS)
  **Description:** Add `@keyframes clause-flash` (ring pulse in `#c8791a`) + `.clause-flash` utility
  to `app/globals.css`, disabled under `prefers-reduced-motion`. Add `clauseNumber(id)` to
  `lib/utils.ts` (numeric suffix of `clause-16` → `16`; fallback index+1).
  **Acceptance criteria:**
  - [x] `.clause-flash` produces a visible accent ring pulse; none under reduced-motion
  - [x] `clauseNumber("clause-16") === 16`
  **Verification:** typecheck + visual spot-check
  **Dependencies:** None
  **Files:** `app/globals.css`, `lib/utils.ts`
  **Scope:** XS

- [x] **Task 3 — Wire provider + migrate scroll callers** (M)
  **Description:** Wrap `app/results/page.tsx` `<main>` in `<ClauseNavigationProvider>`. In
  `RiskDashboard.tsx` replace local `activeTab` state with `useClauseNav()`; `scrollToFirstDealBreaker`
  → `goToClause`. Replace local scroll handlers in `FollowUpInput.tsx`,
  `StatutoryProtectionsPanel.tsx`, `ContradictionsPanel.tsx` with `goToClause(id)`. In `ClauseCard.tsx`
  apply `clause-flash` when `flashId === clause.id`.
  **Acceptance criteria:**
  - [x] Clicking a clause link/ref in any panel switches to the correct tab, scrolls, and flashes
  - [x] Cross-tab references resolve reliably (no more silent no-op)
  **Verification:**
  - [x] Manual: from Red Flags tab, click a Standard-tab clause ref → tab switches + scroll + flash
  **Dependencies:** Tasks 1, 2
  **Files:** `app/results/page.tsx`, `components/analysis/RiskDashboard.tsx`,
  `components/analysis/ClauseCard.tsx`, `components/analysis/FollowUpInput.tsx`,
  `components/analysis/StatutoryProtectionsPanel.tsx`, `components/analysis/ContradictionsPanel.tsx`
  **Scope:** Medium

### Checkpoint: Navigation
- [x] Every clause reference across all panels lands on the right card, across tabs
- [x] Typecheck/lint clean; no orphaned `getElementById` scroll logic (except `JurisdictionMismatchBanner` — Phase 2+)

### Phase 2: Clause identity + Q/A redesign

- [ ] **Task 4 — Clause number badge on cards** (S)
  **Description:** In `ClauseCard.tsx` render a small monospace `#<n>` chip beside the title using
  `clauseNumber(clause.id)`.
  **Acceptance criteria:**
  - [ ] Each card shows a `#n` chip matching the Q/A chip number
  **Verification:** visual check across all tabs
  **Dependencies:** Task 2
  **Files:** `components/analysis/ClauseCard.tsx`
  **Scope:** Small

- [ ] **Task 5 — Q/A clause chips (title + number)** (S)
  **Description:** Pass `idToClause` from `useClauseNav()` into `FollowUpInput`'s `renderAnswer`.
  Render each `[clause-16]` as a styled chip `"<title> #16"`; click → `goToClause(id)`. Render
  `citedClauseIds` as a row of the same chips instead of plain "Cited: ..." text.
  **Acceptance criteria:**
  - [ ] Answer references show the real clause title + number, not raw `[clause-16]`
  - [ ] Cited chips are clickable and navigate correctly
  **Verification:** ask "what happens if I break the nda"; verify chip text + navigation
  **Dependencies:** Tasks 1, 3
  **Files:** `components/analysis/FollowUpInput.tsx`
  **Scope:** Small

- [ ] **Task 6 — Chat-style Q/A layout + empty state** (M)
  **Description:** Restructure `FollowUpInput` thread into a conversational layout (question bubble +
  answer card), add an empty state with 3-4 suggested starter-question pills that prefill+submit,
  and a typing/loading indicator. Restyle input + Ask button to warm palette.
  **Acceptance criteria:**
  - [ ] Empty state shows clickable suggested questions that submit on click
  - [ ] Thread renders as chat bubbles; loading shows an indicator
  **Verification:** manual run through several questions incl. empty state
  **Dependencies:** Task 5
  **Files:** `components/analysis/FollowUpInput.tsx`
  **Scope:** Medium

### Checkpoint: Identity + Q/A
- [ ] Q/A references and card badges are consistent and navigable; empty state works

### Phase 3: Visual overhaul

- [ ] **Task 7 — Summary header + tabs + clause card** (M)
  **Description:** Recolor/retypeset `RiskDashboard.tsx` summary (prominent score, clickable stat
  chips via `goToTab`, warm card), `CategoryTabs.tsx` (accent underline, sticky under summary), and
  `ClauseCard.tsx` to the warm palette + Bricolage/Barlow + shallow shadows + `md`/`lg` radius +
  muted semantic colors.
  **Acceptance criteria:**
  - [ ] Stat chips switch tabs; tabs stick on scroll; cards use muted semantic left-borders
  **Verification:** visual compare to `/` and `/analyze`
  **Dependencies:** Task 3
  **Files:** `components/analysis/RiskDashboard.tsx`, `components/analysis/CategoryTabs.tsx`,
  `components/analysis/ClauseCard.tsx`
  **Scope:** Medium

- [ ] **Task 8 — Remaining panels + page entrance** (M)
  **Description:** Apply warm language to `MissingClausesPanel`, `KeyDatesPanel`, `YourRightsPanel`,
  `ObligationsPanel`, `JurisdictionMismatchBanner`, `CompareToStandard`. Add `ap-rise ap-d1..d4`
  stagger to top-level sections in `app/results/page.tsx`.
  **Acceptance criteria:**
  - [ ] All panels match the design language; sections animate in with stagger
  - [ ] No animation under `prefers-reduced-motion`
  **Verification:** visual sweep + reduced-motion + mobile width
  **Dependencies:** Task 7
  **Files:** `components/analysis/MissingClausesPanel.tsx`,
  `components/analysis/KeyDatesPanel.tsx`, `components/analysis/YourRightsPanel.tsx`,
  `components/analysis/ObligationsPanel.tsx`, `components/analysis/JurisdictionMismatchBanner.tsx`,
  `components/analysis/CompareToStandard.tsx`, `app/results/page.tsx`
  **Scope:** Medium

### Checkpoint: Complete
- [ ] All acceptance criteria met; `bun run lint` + typecheck clean
- [ ] `/results` visually consistent with `/` and `/analyze`
- [ ] Every clause reference (Q/A + panels + stat chips) navigates reliably with flash

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Scroll fires before new tab renders | High | Effect keyed on `[activeTab, pendingScrollId]`, runs post-render |
| Clause id has no numeric suffix | Low | `clauseNumber` falls back to list index+1 |
| Visual drift from landing tokens | Med | Copy inline hex/font patterns directly from `components/landing/*` |
| Reduced-motion users get flash/stagger | Low | Gate all new animation in existing `prefers-reduced-motion` block |

## Open Questions
- None — approach confirmed (full overhaul, title+number chips, switch-tab+scroll+highlight,
  chat-style Q/A).
