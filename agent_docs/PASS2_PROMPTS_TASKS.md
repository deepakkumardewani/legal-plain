# Implementation Plan: Pass-2 Prompt + Schema + UI Improvements

> Companion to [`/Users/deepakdewani1/.claude/plans/lib-prompts-pass2-employment-ts-lib-pro-glittery-toucan.md`](../../../../.claude/plans/lib-prompts-pass2-employment-ts-lib-pro-glittery-toucan.md). Read that first — it contains the legal review and rationale for every change here.
> Status: **Awaiting approval** of the task list itself and Tier scope.

---

## Overview

Improve the three Pass-2 analysis prompts ([pass2-employment.ts](../lib/prompts/pass2-employment.ts), [pass2-lease.ts](../lib/prompts/pass2-lease.ts), [pass2-nda.ts](../lib/prompts/pass2-nda.ts)) so the analysis is more legally accurate, less prone to hallucination, and more actionable. Changes span three layers: prompt text, Zod/TypeScript schema, and React UI in [components/analysis/](../components/analysis/) and [app/results/page.tsx](../app/results/page.tsx). Work is sliced into four tiers so the highest-value, lowest-risk changes ship first.

---

## Architecture Decisions

1. **Tier 1 is prompt-only and ships independently.** No schema or UI work, no breaking changes. Validates direction before we touch data shape.
2. **Schema is the contract.** Any new field added to `aiAnalysisResultSchema` ([lib/schemas.ts](../lib/schemas.ts)) must also land in the matching TypeScript type ([lib/types.ts](../lib/types.ts)) **and** a UI surface, in the same task. We don't ship orphan fields.
3. **New fields are optional, not required.** Reason: avoid breaking existing analyses in Redis cache that lack the field. Validators accept missing; UI renders nothing when absent.
4. **One vertical slice per per-clause field.** F1 (confidence), F2 (negotiability), F3 (vagueness), F4 (incorporation), F8 (nullable excerpt) each travel through prompt → schema → type → ClauseCard as a single task. Avoids the "all schema, then all UI" anti-pattern.
5. **The two new top-level panels (F6 Contradictions, F7 Statutory Protections) get their own tasks** — they're new components and slot positions in results page.
6. **Hallucination check is automated, not aspirational.** Tier 1 ships with a small node script that, given an `AnalysisResult` and source text, verifies every non-null `originalExcerpt` exists verbatim. Runs in CI later; manually for now.
7. **No new dependencies.** All work uses existing Zod / Next.js / Tailwind / shadcn primitives.

---

## Task List

### Phase 1 — Tier 1: Prompt-Only Improvements (no schema, no UI)

#### Task 1: Remove arbitrary `overallRiskScore >= 60` floor

**Description:** Delete the floor instruction from all three prompts; rely on the existing `JurisdictionMismatchBanner` to convey mismatch severity. Maps to plan §F9 / §A7.

**Acceptance criteria:**
- [x] The string `"If mismatch confidence is HIGH, floor the overallRiskScore at 60"` is removed from all three pass2 prompts.
- [x] Replaced with: *"Compute overallRiskScore strictly from clause analysis. Surface jurisdiction mismatch separately."*

**Verification:**
- [x] `rg "floor the overallRiskScore" lib/prompts/` returns nothing.
- [x] Re-run analysis on a fixture with jurisdiction mismatch + clean clauses; confirm score is < 60 and the banner still appears.

**Dependencies:** None
**Files touched:** [lib/prompts/pass2-employment.ts](../lib/prompts/pass2-employment.ts), [lib/prompts/pass2-lease.ts](../lib/prompts/pass2-lease.ts), [lib/prompts/pass2-nda.ts](../lib/prompts/pass2-nda.ts)
**Scope:** XS

---

#### Task 2: Add 8th-grade reading-level instruction to all three prompts

**Description:** Force `plainEnglish`, `riskReason`, `negotiationTip`, `contextNote` to 8th-grade reading level. Plain words, no Latin, one concept per sentence. Maps to plan §F10 / §A9.

**Acceptance criteria:**
- [x] Each prompt contains a "READING LEVEL" instruction block with the 8th-grade requirement, Latin examples, and one-concept-per-sentence rule.
- [x] Instruction placed near the top of the system prompt, before "FOR EACH CLAUSE".

**Verification:**
- [x] Re-run on a known-bad fixture; verify outputs no longer contain "bona fide", "inter alia", "ipso facto", "pursuant to".
- [x] Spot-check 5 plainEnglish strings against Flesch-Kincaid manually.

**Dependencies:** None
**Files touched:** all three pass2 prompts
**Scope:** XS

---

#### Task 3: Move "holistic combined effect" instruction into lease and NDA prompts

**Description:** [pass2-employment.ts:20](../lib/prompts/pass2-employment.ts#L20) has a paragraph about holistic risk that lease and NDA lack. Copy and adapt for each context. Maps to plan §F11 / §A10.

**Acceptance criteria:**
- [x] Lease prompt contains a holistic-effect paragraph naming a realistic combo (e.g., broad waiver + attorney's fees + liquidated damages).
- [x] NDA prompt contains a holistic-effect paragraph (e.g., perpetual confidentiality + non-solicit + non-compete).

**Verification:** Spot-read each prompt for the new paragraph.

**Dependencies:** None
**Files touched:** [pass2-lease.ts](../lib/prompts/pass2-lease.ts), [pass2-nda.ts](../lib/prompts/pass2-nda.ts)
**Scope:** XS

---

#### Task 4: Strengthen `missingClauses[]` output instruction

**Description:** Today's prompts say "flag as missing if absent" but never tell the model *where* to put the finding. Schema already has `missingClauses` ([schemas.ts](../lib/schemas.ts)) and the UI panel exists. Just make the prompt explicit. Maps to plan §A1.

**Acceptance criteria:**
- [x] Each prompt's "IMPORTANT OUTPUT RULES" section contains: *"For each mandatory clause that is absent, add an entry to `missingClauses[]` with `title`, `whyItMatters`, and `whatToAskFor`. Do not list missing clauses inside `clauses[]`."*

**Verification:**
- [x] Re-run on a fixture deliberately missing severance & whistleblower notice; confirm both appear in `missingClauses[]`.
- [x] [MissingClausesPanel.tsx](../components/analysis/MissingClausesPanel.tsx) renders the entries on the results page.

**Dependencies:** None
**Files touched:** all three pass2 prompts
**Scope:** XS

---

#### Task 5: Add anti-hallucination instruction for `originalExcerpt`

**Description:** Forbid paraphrased quotes. Allow null when verbatim quote isn't possible. Schema change for null is in Tier 2 (Task 13); the prompt half lands now. Maps to plan §F8 (prompt half) / §A5.

**Acceptance criteria:**
- [x] Each prompt contains: *"`originalExcerpt` must be a verbatim substring of the document. Never paraphrase, smooth, or reword. If you cannot quote verbatim, omit the clause or (after Task 13) set the field to null."*
- [x] During Tier 1, "set to null" stays as a TODO comment — schema doesn't yet allow null.

**Verification:** Run hallucination-check script (Task 6) on 3 fixtures; expect zero violations.

**Dependencies:** None
**Files touched:** all three pass2 prompts
**Scope:** XS

---

#### Task 6: Add hallucination-check script

**Description:** A small node/bun script that takes an `AnalysisResult` JSON and the source document text, then verifies every non-null `originalExcerpt` is a verbatim substring. Reports violations. Manual for now; CI-ready.

**Acceptance criteria:**
- [x] Script at `scripts/verify-excerpts.ts` reads an analysis JSON + a source text file as args.
- [x] Exits non-zero with a list of clause IDs whose `originalExcerpt` is not found verbatim in source.
- [x] README or comment block explains how to run it.

**Verification:**
- [x] Run against a known-clean fixture: exits 0.
- [x] Run against a deliberately-mutated fixture (one quote altered): exits non-zero with the right clause ID.

**Dependencies:** Task 5 (prompt change motivates this).
**Files touched:** `scripts/verify-excerpts.ts` (NEW)
**Scope:** S

---

#### Task 7: Expand MANDATORY CLAUSES — employment

**Description:** Add the missing items from plan §B1: probationary period, equity vesting / acceleration / exercise window, clawback, TRAPs, non-disparagement (with Speak Out Act note), modification clause, garden leave, IP-assignment choice-of-law (CA §2870 / IL Workplace Transparency Act / WA / MN / NY), 409A, background/drug, holdover obligations. Findings flow through existing `missingClauses[]`.

**Acceptance criteria:**
- [x] [pass2-employment.ts](../lib/prompts/pass2-employment.ts) "MANDATORY CLAUSES TO CHECK" includes all 11 new items.
- [x] No schema or UI changes.

**Verification:** Run on a deliberately-stripped employment fixture; confirm at least 5 of the new items show up in `missingClauses[]`.

**Dependencies:** Task 4 (the instruction Task 4 strengthens is what makes these flow correctly).
**Files touched:** [pass2-employment.ts](../lib/prompts/pass2-employment.ts)
**Scope:** XS

---

#### Task 8: Expand MANDATORY CLAUSES — lease

**Description:** Add plan §C1 items: implied warranty of habitability waiver attempts, attorney's fees directionality, liquidated damages caps, HOA/building rules incorporation, holdover multiplier, smoking/cannabis, quiet enjoyment, mold/asbestos (state-specific), Megan's Law (state-specific), right-of-entry timing/method, insurance minimums (renters + liability), lease assignment vs subletting as **distinct** items, force majeure, rent-control status. Also fix lead-paint scope (§C2): mark as US-specific TSCA §406.

**Acceptance criteria:**
- [x] All 14 new items present.
- [x] Lease assignment and subletting listed as two separate checks.
- [x] Lead-paint item annotated as US-only (TSCA §406).

**Verification:** Run on a stripped lease fixture; confirm appropriate `missingClauses[]` entries.

**Dependencies:** Task 4
**Files touched:** [pass2-lease.ts](../lib/prompts/pass2-lease.ts)
**Scope:** XS

---

#### Task 9: Expand MANDATORY CLAUSES — NDA + fix residuals framing

**Description:** Add plan §D3 items: duration (with trade-secret carve-out), reverse-engineering prohibition, audit rights, liquidated damages, attorney's fees directionality, survival of obligations, source-code escrow, "derived/inferred information" scope. Also fix §D4: the residuals-clause description currently calls it "dangerous for disclosing party" — but this analyzer takes the receiving party's perspective, so a residuals clause is **good** for the user. Invert the framing.

**Acceptance criteria:**
- [x] All 8 new items present in "MANDATORY CLAUSES TO CHECK".
- [x] Residuals clause description matches receiving-party perspective: *"Residuals clauses allow you to use information you naturally remember. Generally favorable to the receiving party."*
- [x] Add §D5 instruction: *"If duration is a flat number without a trade-secret carve-out, flag as YELLOW — flat-duration confidentiality may be unenforceable for true trade secrets."*

**Verification:** Run on an NDA fixture with a residuals clause; confirm output framing is from receiving party's side.

**Dependencies:** Task 4
**Files touched:** [pass2-nda.ts](../lib/prompts/pass2-nda.ts)
**Scope:** S

---

#### Task 10: Non-compete enforceability mapping (employment)

**Description:** Add explicit jurisdiction → enforceability mapping for non-competes. Maps to plan §B2.

**Acceptance criteria:**
- [x] Employment prompt contains a "NON-COMPETE ENFORCEABILITY" block listing: void in CA, ND, OK, MN (post-July 2023); salary-thresholded in WA, IL, OR; subject to FTC litigation.
- [x] Instruction: *"If the contract contains a non-compete and `effectiveJurisdiction` is one of {CA, ND, OK, MN}, mark RED and explain enforceability."*

**Verification:** Run on a CA employment fixture with a non-compete; confirm RED + enforceability explanation.

**Dependencies:** Task 1 (don't want stale floor logic interacting)
**Files touched:** [pass2-employment.ts](../lib/prompts/pass2-employment.ts)
**Scope:** XS

---

#### Task 11: Whistleblower safe-harbor mention (employment + NDA)

**Description:** Surface statutory rights that override the contract — DTSA §1833(b) (employment), Speak Out Act (employment + NDA), SEC Rule 21F-17 (NDA), CA SB 331 / NY GOL §5-336 (employment + NDA). For Tier 1 these surface as YELLOW clauses inside `clauses[]` (no new schema field yet — that's Tier 3 / Task 17). Maps to plan §B5 + §D2.

**Acceptance criteria:**
- [x] Employment prompt: *"If the document omits DTSA §1833(b) immunity notice and `effectiveJurisdiction` is US, add a YELLOW clause titled 'Missing DTSA whistleblower notice'."*
- [x] NDA prompt: same instruction for DTSA + an additional check for Speak Out Act / SEC 21F-17 conflicts.

**Verification:** Run on a US employment NDA missing DTSA notice; confirm a YELLOW clause appears.

**Dependencies:** None
**Files touched:** [pass2-employment.ts](../lib/prompts/pass2-employment.ts), [pass2-nda.ts](../lib/prompts/pass2-nda.ts)
**Scope:** S

---

### Checkpoint: Phase 1 complete

- [x] All three prompts updated and bun build clean.
- [x] Hallucination-check script passes on three fixtures (one per type).
- [x] Re-run analysis on a corpus of past documents (if available); diff `overallRiskScore` — manually review any movement >20 pts.
- [ ] Human reviews 3 sample analyses (one per document type) end-to-end via the running dev server.
- [ ] Approval to proceed to Tier 2.

---

### Phase 2 — Tier 2: Per-Clause Schema + UI Additions

Each task in this phase is a complete vertical slice: prompt instruction + Zod field + TypeScript type + ClauseCard UI.

#### Task 12: F1 — Per-clause `confidence` field

**Description:** Add `confidence: "HIGH" | "MEDIUM" | "LOW"` per clause. Prompts emit it; ClauseCard renders a muted "Low confidence" chip when LOW. Maps to plan §F1 / §A6.

**Acceptance criteria:**
- [x] Prompt instruction in all three: emit `confidence` per clause; LOW when document is ambiguous or jurisdiction obscure.
- [x] [schemas.ts](../lib/schemas.ts) `clauseAnalysisSchema` adds `confidence: z.enum(["HIGH","MEDIUM","LOW"]).optional()`.
- [x] [types.ts](../lib/types.ts) `ClauseAnalysis` mirrors.
- [x] [ClauseCard.tsx](../components/analysis/ClauseCard.tsx) renders "Low confidence" chip next to the risk-level chip only when `confidence === "LOW"`.

**Verification:** Fixture with ambiguous clause renders the chip; clean clause does not.

**Dependencies:** Phase 1 complete.
**Files touched:** 3 prompts, schemas.ts, types.ts, ClauseCard.tsx
**Scope:** S

---

#### Task 13: F8 — Nullable `originalExcerpt`

**Description:** Allow null when verbatim quote impossible; ClauseCard hides the "Show original text" button and shows a small explanatory note. Maps to plan §F8 (schema/UI half — prompt half landed in Task 5).

**Acceptance criteria:**
- [x] Prompt instruction updated to *actually* allow null (remove TODO from Task 5).
- [x] `clauseAnalysisSchema.originalExcerpt` changed to `z.string().nullable()`.
- [x] `ClauseAnalysis.originalExcerpt` typed `string | null`.
- [x] [ClauseCard.tsx](../components/analysis/ClauseCard.tsx): when null, the "Show/Hide original text" button is hidden and an italic line *"Source text not quotable — see plain-English explanation above."* renders in its place.

**Verification:** Fixture with one null excerpt renders the note; existing fixtures with strings still toggle correctly.

**Dependencies:** Task 5, Task 12 (touches same ClauseCard surface).
**Files touched:** 3 prompts, schemas.ts, types.ts, ClauseCard.tsx
**Scope:** S

---

#### Task 14: F2 — Per-clause `negotiability` field

**Description:** Add `negotiability: "HIGH" | "MEDIUM" | "LOW" | "TAKE_IT_OR_LEAVE_IT"`. ClauseCard prepends a label in the negotiation-tip block and swaps the block title when `TAKE_IT_OR_LEAVE_IT`. Maps to plan §F2 / §A8.

**Acceptance criteria:**
- [x] Prompt: instruct realistic negotiability assessment based on power dynamics.
- [x] Schema + type: optional enum.
- [x] [ClauseCard.tsx](../components/analysis/ClauseCard.tsx#L60) negotiation block: when `TAKE_IT_OR_LEAVE_IT`, swap block title to "What you can do" and instruct model (via prompt) to populate `negotiationTip` with coping alternatives (document concern in writing, time-bound waiver, etc.) instead of negotiation script.
- [x] Other values render a small label prefix: "Likely negotiable", "Hard to negotiate", "Likely non-negotiable".

**Verification:** Fixture with a unilateral take-it-or-leave-it clause renders "What you can do" with coping advice.

**Dependencies:** Task 13
**Files touched:** 3 prompts, schemas.ts, types.ts, ClauseCard.tsx
**Scope:** S

---

#### Task 15: F3 — `vaguenessFlags` per clause

**Description:** Model extracts specific vague phrases ("sole discretion", "as may be amended", etc.). ClauseCard shows a compact amber warning line. Maps to plan §F3 / §A2.

**Acceptance criteria:**
- [x] Prompt: instruct extraction of vague/discretionary phrases as an array of verbatim strings.
- [x] Schema: `vaguenessFlags: z.array(z.string()).optional()` on `clauseAnalysisSchema`.
- [x] Type mirrored.
- [x] [ClauseCard.tsx](../components/analysis/ClauseCard.tsx): inline single-line amber warning under "Why": *"Watch for discretionary language: 'sole discretion'."*. Hidden when empty/absent.

**Verification:** Fixture with a "sole discretion" clause renders the warning; clean clause does not.

**Dependencies:** Task 14
**Files touched:** 3 prompts, schemas.ts, types.ts, ClauseCard.tsx
**Scope:** S

---

#### Task 16: F4 — `incorporatedReferences` per clause

**Description:** Detect references to external documents (Exhibit A, Employee Handbook, etc.). ClauseCard shows a chip on the card header. Prompt also auto-bumps such clauses to at least YELLOW. Maps to plan §F4 / §A3.

**Acceptance criteria:**
- [x] Prompt: detect external references and (a) populate `incorporatedReferences` and (b) ensure `riskLevel` is at least YELLOW for clauses with non-empty references.
- [x] Schema/type: optional string array.
- [x] [ClauseCard.tsx](../components/analysis/ClauseCard.tsx): chip on card header reading *"References Exhibit A (not shown)"* (or *"References N external documents"* when > 1).

**Verification:** Fixture with "per the Employee Handbook" renders chip and clause is YELLOW or above.

**Dependencies:** Task 15
**Files touched:** 3 prompts, schemas.ts, types.ts, ClauseCard.tsx
**Scope:** S

---

### Checkpoint: Phase 2 complete

- [x] All five new per-clause fields render correctly on the results page.
- [x] No regression in existing fields (risk chip, comparison, obligation, negotiation tip, context note, mismatch chip).
- [x] Build + tests clean.
- [x] Manual walkthrough on dev server with fixtures exercising each new field.
- [x] Approval to proceed to Tier 3.

---

### Phase 3 — Tier 3: New Top-Level Panels

#### Task 17: F7 — `statutoryProtections[]` + StatutoryProtectionsPanel

**Description:** Add a top-level `statutoryProtections` array. Surface statutes that give users rights the contract can't override. New panel above `MissingClausesPanel`. Maps to plan §F7 / §A12.

**Acceptance criteria:**
- [x] Prompt: instruct surfacing of relevant statutes for the jurisdiction (DTSA, Speak Out Act, SEC 21F-17, state deposit caps, FLSA, FEHA, etc.).
- [x] Schema: `statutoryProtections: z.array(z.object({ name, jurisdiction, summary, overridesClauseId: z.string().optional() })).optional()` on `aiAnalysisResultSchema`.
- [x] Type mirrored.
- [x] New `components/analysis/StatutoryProtectionsPanel.tsx`: positive-tone (green/teal) section titled *"Your rights regardless of this contract"*. When `overridesClauseId` set, button scrolls to that clause (reuse pattern from [JurisdictionMismatchBanner.tsx](../components/analysis/JurisdictionMismatchBanner.tsx#L11)).
- [x] Slot into [app/results/page.tsx](../app/results/page.tsx) above `MissingClausesPanel`.
- [x] Panel hides when array empty/absent.
- [x] Removes the workaround from Task 11 (DTSA/Speak Out checks now flow through this panel instead of YELLOW clauses).

**Verification:** Fixture with employment contract in CA renders FEHA + DTSA + Speak Out Act protections.

**Dependencies:** Phase 2 complete; Task 11 (workaround removal).
**Files touched:** 3 prompts, schemas.ts, types.ts, StatutoryProtectionsPanel.tsx (NEW), app/results/page.tsx
**Scope:** M

---

#### Task 18: F6 — `contradictions[]` + ContradictionsPanel

**Description:** Detect internal contradictions (e.g., one clause says 30-day notice, another says 60). New panel between Missing and KeyDates. Maps to plan §F6 / §A4.

**Acceptance criteria:**
- [x] Prompt: instruct scan for internal contradictions, output `{ description, clauseIds: string[] }`.
- [x] Schema: `contradictions: z.array(z.object({ description: z.string().min(1), clauseIds: z.array(z.string()).min(2) })).optional()`.
- [x] Type mirrored.
- [x] New `components/analysis/ContradictionsPanel.tsx`: each row shows description + buttons that scroll to each conflicting clause.
- [x] Slotted between `MissingClausesPanel` and `KeyDatesPanel` in [app/results/page.tsx](../app/results/page.tsx).
- [x] Hides when empty/absent.

**Verification:** Fixture with deliberately contradicting notice periods renders the panel with both clause-scroll buttons working.

**Dependencies:** Task 17
**Files touched:** 3 prompts, schemas.ts, types.ts, ContradictionsPanel.tsx (NEW), app/results/page.tsx
**Scope:** M

---

#### Task 19: F5 — `dealBreaker` per clause + per-card banner + top-level strip

**Description:** Mark clauses the user shouldn't sign as `dealBreaker: true`. Per-card red banner + top-of-RiskDashboard strip linking to first deal-breaker. Maps to plan §F5.

**Acceptance criteria:**
- [x] Prompt: instruct conservative marking — only true walk-aways (perpetual NDA, broad non-compete in enforceable state, class-action waiver on top of mandatory arbitration, etc.).
- [x] Schema/type: optional boolean on `clauseAnalysisSchema`.
- [x] [ClauseCard.tsx](../components/analysis/ClauseCard.tsx): prominent red banner inside the card when true: *"Walk-away clause — read this first."*
- [x] [RiskDashboard.tsx](../components/analysis/RiskDashboard.tsx): when any clause has `dealBreaker: true`, render a top strip above CategoryTabs: *"⚠ X deal-breaker clause(s) found — review before signing"* with a button that scrolls to the first one.

**Verification:** Fixture with a textbook walk-away clause shows both the strip and the per-card banner; scroll works.

**Dependencies:** Task 18
**Files touched:** 3 prompts, schemas.ts, types.ts, ClauseCard.tsx, RiskDashboard.tsx
**Scope:** M

---

### Checkpoint: Phase 3 complete

- [x] All three new top-level signals render and link correctly.
- [x] Empty-state behavior verified for all three panels.
- [x] No regression in existing results page layout.
- [x] Approval to proceed to Tier 4.

---

### Phase 4 — Tier 4: Structural / Flow Changes

#### Task 20: F12 — `userRole` for NDA flow

**Description:** Allow user to indicate disclosing / receiving / mutual for NDAs. Reframes the entire NDA analysis. Maps to plan §F12 / §A14 / §D1.

**Acceptance criteria:**
- [x] `Pass2Input` in [pass2-selector.ts](../lib/prompts/pass2-selector.ts#L13) adds `userRole?: "RECEIVING" | "DISCLOSING" | "MUTUAL"`.
- [x] [pass2-nda.ts](../lib/prompts/pass2-nda.ts) branches: receiving (current behavior), disclosing (favors enforceability), mutual (balanced).
- [x] `app/analyze/page.tsx`: when Pass-1 returns `documentType === "NDA"`, present a single shadcn select-question step before kicking off Pass-2.
- [x] Analyze API route accepts and forwards `userRole`.
- [x] Existing analyses without `userRole` default to "RECEIVING" (backward compat).

**Verification:** Upload an NDA, pick "DISCLOSING"; confirm clause analysis frames clauses from disclosing party's perspective.

**Dependencies:** Phase 3 complete.
**Files touched:** pass2-selector.ts, pass2-nda.ts, app/analyze/page.tsx, analyze API route
**Scope:** M

---

#### Task 21: Commercial-lease detection gate

**Description:** When Pass-1 detects a commercial lease, refuse to analyze with the residential prompt. Maps to plan §C3.

**Acceptance criteria:**
- [x] Pass-1 prompt updated to set a `subtype` hint (residential vs commercial vs ambiguous) on lease documents.
- [x] When commercial, analyze API returns a structured error; analyze page shows: *"This looks like a commercial lease. This analyzer is tuned for residential leases only — the tenant protections we'd cite don't apply."*

**Verification:** Upload a commercial lease fixture; confirm the gate message renders and Pass-2 is not called.

**Dependencies:** Task 20
**Files touched:** Pass-1 prompt, analyze API route, app/analyze/page.tsx
**Scope:** S

---

#### Task 22: Few-shot examples per prompt

**Description:** Add 1–2 short clause examples per risk level to each prompt to tighten consistency. Maps to plan §A13.

**Acceptance criteria:**
- [x] Each prompt has a "RISK LEVEL EXAMPLES" section with 1-2 short examples for each of RED / YELLOW / CONTEXT_DEPENDENT / GREEN.
- [x] Examples are realistic, short, and document-type-appropriate.

**Verification:** Run the same fixture through the prompts 5 times; risk labels should be more stable than before.

**Dependencies:** Task 21
**Files touched:** 3 prompts
**Scope:** S

---

#### Task 23: Non-US employment branch

**Description:** Employment prompt currently assumes US at-will employment. Add a branch for non-US jurisdictions covering notice periods, statutory severance, works councils, etc. Maps to plan §B3.

**Acceptance criteria:**
- [x] [pass2-employment.ts](../lib/prompts/pass2-employment.ts) detects US vs non-US from `effectiveJurisdiction`.
- [x] Non-US branch replaces at-will section with notice-period guidance, references statutory severance frameworks where the model is confident.
- [x] When jurisdiction is non-US but unknown to the model, set per-clause `confidence: LOW` and surface a note.

**Verification:** Run on a UK employment fixture; confirm at-will language is absent and notice-period guidance appears.

**Dependencies:** Task 22
**Files touched:** [pass2-employment.ts](../lib/prompts/pass2-employment.ts)
**Scope:** S

---

### Checkpoint: Phase 4 complete

- [x] All structural changes work end-to-end on the dev server.
- [x] Full regression: re-run all fixtures, diff against post-Phase-3 baseline, manually review any unexpected movement.
- [x] Tests pass, build clean.

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Cached analyses in Redis lack new optional fields → UI crashes | High | Every new field optional; UI guards on absence. Verified in Phase 2/3 checkpoints. |
| Prompt changes make scores drift unpredictably for in-flight users | Medium | Score regression check in Phase 1 checkpoint; flag any document moving >20 pts. |
| Model emits invalid enum values for new fields (confidence/negotiability) | Medium | Zod validation catches; analyze API has fallback error path. Add a coercion layer if it shows up in practice. |
| Hallucinated `originalExcerpt` slips through despite prompt fix | High | Task 6 script; can promote to CI gate later. |
| NDA `userRole` step adds friction → drop-off | Low | Pre-fill RECEIVING as default; one click to confirm. Track conversion before/after. |
| Adding many MANDATORY clauses bloats prompt → cost + latency | Low/Medium | Each prompt ~doubles. Acceptable; if it becomes a problem, split into per-jurisdiction sub-prompts later. |
| Lease commercial gate (Task 21) blocks legitimate live/work leases | Medium | "Ambiguous" subtype in Pass-1 lets it through with a warning, doesn't hard-block. |

## Open Questions

- **Q1:** Should existing Redis-cached analyses be invalidated on schema change, or do we rely on optional-field tolerance? (Recommendation: tolerance — cheaper, no user-visible churn.)
- **Q2:** Score regression in Phase 1 — do we have a corpus of past analyses to diff against, or do we generate fixtures fresh?
- **Q3:** For Task 11 → Task 17 transition, do we accept the temporary state where DTSA/Speak Out appear as YELLOW clauses during Phases 1–2 before becoming statutoryProtections in Phase 3?
- **Q4:** Tier 4 Task 23 (non-US employment) — which jurisdictions should we explicitly model in the prompt vs leave as "LOW confidence, generic guidance"?
