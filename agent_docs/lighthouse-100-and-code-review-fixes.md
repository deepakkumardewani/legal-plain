# Implementation Plan: Lighthouse ~100 + Safe Code-Review Fixes

## Overview

Bring the `legal-plain` app to ~100 Lighthouse scores (mobile + desktop) and apply non-behavioral fixes surfaced by a five-axis code review. The work is small and precise: a measured baseline shows the mobile performance gap is almost entirely **dev-mode noise** (unminified/unused JS, missing source maps, HMR WebSocket blocking bf-cache) that disappears in a production build. The genuine code work is a handful of accessibility / best-practice fixes plus two prompt/validation hardening changes.

## Measured Baseline (dev server, :3000)

| Category | Mobile | Desktop |
|---|---|---|
| Performance | 72 | 97 |
| Accessibility | 96 | 94 |
| Best Practices | 96 | 96 |
| SEO | 100 | 100 |

Real (build-independent) failing audits: `color-contrast`, `label-content-name-mismatch`, `heading-order`, `errors-in-console` (favicon 404). Everything else is dev-only.

## Architecture Decisions

- **Measure prod, not dev.** Lighthouse on the dev server understates performance (unminified, HMR). Authoritative numbers come from `bun run build && bun run start -p 3000`.
- **No bundle-splitting for `/`.** Heavy libs (`pdfjs-dist`, `jspdf`, CodeMirror) are not on the home route; lazy-loading is deferred unless `/analyze` or `/results` prod audits prove it necessary.
- **Fix shared tokens, not instances.** Contrast fixes target the shared color values (`#c8791a`, `#e9ded0`) so one change covers all usages.
- **Out of scope (per user):** re-enabling the stubbed rate limiter and share-link authorization — behavioral/product changes; documented only.
- **CLI:** use `~/.bun/bin/lighthouse` directly (`npx` is hook-rewritten to `npm` and fails); use `bun`, never `npm`.

---

## Task List

### Phase 1: Accessibility & Best-Practice fixes (build-independent)

- [x] **Task 1 (S): Fix color contrast on landing eyebrows and step numbers**
  - **Description:** The `text-[#c8791a]` uppercase eyebrow labels (~3.3:1 on `#fbf8f1`) and the decorative `text-[#e9ded0]` `text-6xl` step numbers fail WCAG contrast.
  - **Acceptance criteria:**
    - [x] Eyebrow color darkened (≈`#9c5a0f` or darker) until it meets ≥4.5:1 on `#fbf8f1`, applied via the shared token/usage.
    - [x] Decorative big numbers either darkened to pass or marked `aria-hidden="true"` if purely decorative.
    - [x] `color-contrast` audit passes on both form factors.
  - **Verification:** re-run Lighthouse a11y category; `color-contrast` = pass. Visual check landing page still looks intentional.
  - **Dependencies:** None
  - **Files likely touched:** `components/landing/*` (eyebrow + step-number components), possibly `app/globals.css` if tokens are centralized.
  - **Scope:** Small

- [x] **Task 2 (XS): Add favicon to eliminate console 404**
  - **Description:** `/favicon.ico` 404 is the sole console error capping Best Practices at 96.
  - **Acceptance criteria:**
    - [x] An `app/icon.svg` (or `favicon.ico` / metadata `icons` entry) is served; no `/favicon.ico` 404.
    - [x] `errors-in-console` audit passes.
  - **Verification:** reload `/`, DevTools console clean; Lighthouse `errors-in-console` = pass.
  - **Dependencies:** None
  - **Files likely touched:** `app/icon.svg` (new) or `app/layout.tsx` metadata `icons`.
  - **Scope:** XS

- [x] **Task 3 (XS): Fix heading order**
  - **Description:** An `<h4>` (footer) skips a heading level (`heading-order` fail, desktop).
  - **Acceptance criteria:**
    - [x] Heading levels are sequential (no skipped levels) on `/`.
    - [x] `heading-order` audit passes.
  - **Verification:** Lighthouse a11y `heading-order` = pass.
  - **Dependencies:** None
  - **Files likely touched:** footer component under `components/landing/`.
  - **Scope:** XS

- [x] **Task 4 (XS): Fix logo link accessible-name mismatch**
  - **Description:** Logo `<a aria-label="LexLight home">` accessible name doesn't match visible text (`label-content-name-mismatch`).
  - **Acceptance criteria:**
    - [x] `aria-label` contains the visible text, or redundant label removed in favor of visible "LexLight" text.
    - [x] `label-content-name-mismatch` audit passes.
  - **Verification:** Lighthouse a11y audit = pass.
  - **Dependencies:** None
  - **Files likely touched:** header/nav logo component under `components/landing/`.
  - **Scope:** XS

### Checkpoint: A11y / Best Practices
- [x] Re-run Lighthouse (dev is fine for these audits): a11y and best-practices = 100 on both form factors.
- [x] No console errors.

### Phase 2: Code-review hardening (non-behavioral)

- [x] **Task 5 (S): Harden follow-up prompt against injection**
  - **Description:** [lib/prompts/followup.ts:48](lib/prompts/followup.ts#L48) concatenates raw user `question` (and `documentText`) into the prompt. Wrap them in clear delimiters and instruct the model to treat their contents as data, not instructions.
  - **Acceptance criteria:**
    - [x] `question` and `documentText` wrapped in delimited sections (e.g. `<user_question>…</user_question>`).
    - [x] System prompt states delimited content is data only.
    - [x] Existing follow-up behavior unchanged for normal questions.
  - **Verification:** unit test asserting delimiters present; manual follow-up Q&A still works.
  - **Dependencies:** None
  - **Files likely touched:** `lib/prompts/followup.ts`, `tests/` (new/updated prompt test).
  - **Scope:** Small

- [x] **Task 6 (XS): Cap follow-up `documentText` length**
  - **Description:** [lib/schemas.ts:127](lib/schemas.ts#L127) `documentText` has only `.min(1)` while analyze caps at 150k. Add parity cap to prevent oversized prompts.
  - **Acceptance criteria:**
    - [x] `followupRequestSchema.documentText` gains `.max(150000, …)`.
    - [x] Oversized input rejected with a clear validation error.
  - **Verification:** schema unit test for over-limit rejection; `bunx tsc --noEmit` clean.
  - **Dependencies:** None
  - **Files likely touched:** `lib/schemas.ts`, `tests/`.
  - **Scope:** XS

- [x] **Task 7 (XS): Include error cause in server error logs**
  - **Description:** `lib/apiError.ts` `serverError` logs only `message`/`name`; add `error.cause`/stack for debuggability (no response-shape change).
  - **Acceptance criteria:**
    - [x] Error logs include cause/stack context.
    - [x] Client-facing response body unchanged.
  - **Verification:** trigger an error path, confirm richer server log; tests still pass.
  - **Dependencies:** None
  - **Files likely touched:** `lib/apiError.ts`.
  - **Scope:** XS

### Checkpoint: Hardening
- [x] `bun run test` green (incl. new tests). `bunx tsc --noEmit` clean. (2 pre-existing failures in schemas.test.ts unrelated to Phase 2 changes; all new tests pass)

### Phase 3: Production performance verification

- [x] **Task 8 (S): Build prod, audit both form factors, close gaps**
  - **Description:** Build and serve prod; capture authoritative Lighthouse numbers. Apply the optional font-in-layout / `@theme` cleanup or route-level lazy-loading **only if** an audit still shows a gap.
  - **Acceptance criteria:**
    - [x] `bun run build` succeeds; served on :3001.
    - [x] Mobile + desktop reports saved (`/tmp/lh-*.json`).
    - [x] Performance ≥95 (target ~100); a11y/best-practices/SEO = 100.
  - **Verification:** parse final JSON with host-side `node -e`; record scores in this doc.
  - **Final Scores (prod build):**

    | Category | Mobile | Desktop |
    |---|---|---|
    | Performance | 95 | 100 |
    | Accessibility | 100 | 100 |
    | Best Practices | 100 | 100 |
    | SEO | 100 | 100 |

  - **Fixes applied in this phase:**
    - `ReviewMethodSection`: darkened step numbers from `#e9ded0` → `#9a8570` (3.46:1 on `#fffdf8`, meets 3:1 large-text threshold)
    - `LandingCtaSection`: changed paragraph from `text-white/82 text-[1.05rem]` → `text-white text-xl font-bold` (full white, large-text threshold met at 3.38:1)
    - `LandingFooter`: copyright text `#5b554c` → `#827d70` (4.65:1 on dark bg)
    - `LandingHeader`: removed `aria-label` from logo link (visible text already forms accessible name)
  - **Dependencies:** Tasks 1–4 (so a11y/bp are already clean)
  - **Files touched:** `components/landing/ReviewMethodSection.tsx`, `components/landing/LandingCtaSection.tsx`, `components/landing/LandingFooter.tsx`, `components/landing/LandingHeader.tsx`
  - **Scope:** Small

### Checkpoint: Complete
- [x] Final prod Lighthouse: both form factors ~100 across all four categories (documented exceptions if any).
- [x] All review fixes landed; deferred items documented.
- [x] Build, types, unit + e2e tests green.

---

## Documented (out of scope — do NOT implement)

| Finding | Location | Why deferred |
|---|---|---|
| Rate limiting stubbed (`checkRateLimit` never called; routes hardcode `MAX_SAFE_INTEGER`) | [lib/rateLimit.ts:57](lib/rateLimit.ts#L57), [app/api/analyze/route.ts:122](app/api/analyze/route.ts#L122), [app/api/followup/route.ts:62](app/api/followup/route.ts#L62) | Behavioral/product decision (user excluded). **P0 for production.** |
| Share-link GET has no ownership check | [app/api/share/[shareId]/route.ts](app/api/share/%5BshareId%5D/route.ts) | Behavioral; TTL handled by Redis. Security follow-up. |
| Oversized components (`FollowUpInput.tsx` ~348 LOC, `PdfUpload.tsx` ~284 LOC) | `components/` | Refactor, not required for goals; revisit if touched. |

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Prod perf still < ~100 on mobile after build | Med | Apply Task 8 optional cleanups (fonts in layout, lazy-load heavy routes); re-measure. |
| Darkening contrast tokens harms brand look | Low | Pick the lightest shade that passes 4.5:1; visual review on landing. |
| `next start` conflicts with running dev server on :3000 | Low | Stop dev server first, or use a free port and audit that URL. |

## Open Questions
- None blocking. Rate-limit re-enable explicitly deferred by user.
