# Spec: LexLight
*Updated after legal audit — v2*

---

## Objective

Build a free, zero-account web tool that lets anyone paste or upload a legal document and instantly receive a structured, plain-English risk analysis — clause by clause, color-coded by risk level, with jurisdiction-aware comparison to industry norms, negotiation guidance, and detection of missing clauses.

**The core problem:** Most people sign contracts without a lawyer. Existing tools are paywalled, generic, or have terrible UX. DoNotPay collapsed. Nothing clean, fast, and free exists.

**User:** Anyone signing a contract — employment offers, NDAs, or residential leases (v1 scope). No account required, ever.

> **Scope decision (v1):** Launch with three document types — Employment Contract, NDA, Residential Lease. Each gets a tailored prompt template. These cover ~80% of the non-lawyer use case. Generic/agnostic analysis produces mediocre output across all types; type-specific prompts produce excellent output for the three that matter most. Additional document types ship in v2 once prompt quality is validated.

**User stories:**
- As a user, I must acknowledge a legal disclaimer before any analysis runs
- As a user, I can paste legal text or drag in a PDF and receive a full analysis within 35 seconds
- As a user, I can optionally provide my jurisdiction (US state / country) for more accurate risk assessment
- As a user, I can see each clause categorized as 🔴 Red Flag / 🟡 Unusual / ⚪ Context-Dependent / 🟢 Standard
- As a user, I can see what clauses are missing that should typically exist in this document type
- As a user, I can see key dates and deadlines extracted from the contract
- As a user, I can see both my obligations and my rights under the contract
- As a user, I can see plain-English negotiation language for each red flag clause
- As a user, I can ask follow-up questions about the document (up to 3 per analysis)
- As a user, I can see an overall risk score and document type at the top
- As a user, I can export my analysis as PDF, Markdown, or a shareable link (24hr TTL, clearly disclosed)
- As a user, I am never asked to create an account or log in

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) React (19.2) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Document Input | CodeMirror 6 (paste) + pdf.js (PDF upload, client-side only) |
| AI | Anthropic API (`claude-sonnet-4-6`) via Next.js API route |
| Rate Limiting | Upstash Redis (anonymous userId-based, 10 analyses/day + 10 follow-up questions/analysis). userId is a UUID generated client-side on first visit and persisted in `localStorage` (with `indexedDB` fallback). No signup/signin. |
| Share Link Storage | Upstash Redis / Vercel KV (24hr TTL, auto-expiry — analysis JSON only, never raw document text) |
| Export | jsPDF (PDF export), native Blob (Markdown download) |
| Analytics | Plausible (privacy-first, no cookie banner needed) |
| Deployment | Vercel |

---

## Commands

```bash
# Development
bun run dev              # Start dev server at localhost:3000

# Build & Deploy
bun run build            # Production build
bun run start            # Start production server

# Code Quality
bun run lint             # oxlint check
bun run lint:fix         # oxlint auto-fix
bun run format           # oxfmt write
bun run format:check     # oxfmt check (CI)
bun run type-check       # TypeScript type check (tsc --noEmit)

# Testing
bun run test             # Run unit/integration tests (Vitest)
bun run test:watch       # Vitest watch mode
bun run test:coverage    # Vitest coverage (v8)
bun run test:e2e         # Playwright end-to-end tests
```

---

## Project Structure

```
lexlight/
├── app/
│   ├── page.tsx                        # Landing page — disclaimer gate + input area
│   ├── results/
│   │   └── [shareId]/page.tsx          # Shared analysis view (24hr link, then 404)
│   ├── api/
│   │   ├── analyze/route.ts            # POST — proxies Anthropic API, rate limits, runs 3-pass analysis
│   │   ├── followup/route.ts           # POST — follow-up question against stored analysis context
│   │   └── share/route.ts             # POST — saves analysis JSON to KV, returns shareId
│   └── layout.tsx                      # Root layout, Plausible script
├── components/
│   ├── input/
│   │   ├── DisclaimerGate.tsx          # REQUIRED: must be acknowledged before analysis runs
│   │   ├── JurisdictionSelector.tsx    # Optional US state / country selector
│   │   ├── DocumentInput.tsx           # CodeMirror 6 paste area
│   │   ├── PdfUpload.tsx              # Drag-and-drop PDF zone, pdf.js parsing
│   │   └── AnalyzeButton.tsx          # Submit trigger + rate limit feedback
│   ├── analysis/
│   │   ├── JurisdictionMismatchBanner.tsx  # Mismatch banner — renders above all clause tabs when present
│   │   ├── RiskDashboard.tsx           # Overall score + doc type + jurisdiction header
│   │   ├── ClauseCard.tsx             # Clause with badge + explanation + negotiation tip
│   │   ├── CategoryTabs.tsx            # 4 tabs: Red Flags / Unusual / Context-Dependent / Standard
│   │   ├── MissingClausesPanel.tsx     # "What's missing" — absent clauses that should exist
│   │   ├── KeyDatesPanel.tsx           # Deadlines, notice periods, auto-renewal dates
│   │   ├── YourRightsPanel.tsx         # Rights granted to the user under this contract
│   │   ├── ObligationsPanel.tsx        # What the user must do under this contract
│   │   ├── FollowUpInput.tsx           # "Ask a question about this document" (3 max)
│   │   └── CompareToStandard.tsx       # Tooltip: "Broader than typical because..."
│   ├── export/
│   │   ├── ExportMenu.tsx             # PDF / Markdown / Share link dropdown
│   │   └── ShareLinkModal.tsx         # Copy link + 24hr expiry disclosure
│   └── ui/                            # shadcn/ui primitives (Button, Badge, Card, etc.)
├── lib/
│   ├── anthropic.ts                   # Typed Anthropic client wrapper
│   ├── prompts/
│   │   ├── index.ts                   # Prompt selector by document type
│   │   ├── pass1-detect.ts            # Pass 1: detection + jurisdiction extraction
│   │   ├── pass2-employment.ts        # Pass 2 prompt tailored for employment contracts
│   │   ├── pass2-nda.ts              # Pass 2 prompt tailored for NDAs
│   │   ├── pass2-lease.ts            # Pass 2 prompt tailored for residential leases
│   │   ├── jurisdiction-mismatch.ts  # Mismatch context snippets injected into Pass 2 prompts
│   │   └── followup.ts               # Follow-up question prompt
│   ├── rateLimit.ts                   # Upstash Redis userId rate limit (+ IP abuse guard)
│   ├── userId.ts                      # Client-side anonymous UUID — localStorage + indexedDB fallback
│   ├── pdfParser.ts                   # pdf.js client-side text extraction
│   ├── exportPdf.ts                   # jsPDF export logic
│   └── types.ts                       # Shared TypeScript types
├── tests/
│   ├── setup.ts                       # Vitest setup — RTL matchers, jsdom polyfills
│   ├── unit/
│   │   ├── prompts.test.ts
│   │   ├── rateLimit.test.ts
│   │   └── pdfParser.test.ts
│   └── integration/
│       ├── analyze.test.ts            # Full 3-pass flow with mocked Anthropic client
│       └── followup.test.ts           # Follow-up question route tests
├── vitest.config.ts                   # Vitest config (jsdom, v8 coverage, setup file)
├── playwright.config.ts               # Playwright config
├── .oxlintrc.json                     # oxlint rules
├── oxfmt.toml                         # oxfmt config (if non-default)
├── e2e/
│   ├── analyze-flow.spec.ts           # Disclaimer → paste → analyze → results
│   ├── pdf-upload.spec.ts             # PDF drag-and-drop → analysis
│   ├── followup.spec.ts               # Ask question about document
│   └── share-link.spec.ts             # Share → visit link → 404 after expiry
├── public/
│   ├── sample-nda.pdf                 # Demo NDA for first-time users
│   ├── sample-employment.pdf          # Demo employment contract
│   └── sample-lease.pdf              # Demo residential lease
└── .env.local                         # ANTHROPIC_API_KEY, UPSTASH_* (never committed)
```

---

## Core Architecture: Three-Pass Analysis

### Architecture Decision
Pass 2 is a **single API call** (not parallel per-clause calls). Legal risk is systemic — clauses must be evaluated together because their combined effect determines true risk. Parallel isolated calls produce inconsistent severity ratings and miss cross-clause compounding. A single Pass 2 call with full document context produces cohesive, accurate output.

---

### Pass 1 — Document Detection & Jurisdiction (~3-5s)

Send the first ~3000 tokens to Claude:

- Validate it is actually a legal document → if not, return `{ valid: false, reason: "..." }` and abort
- Detect document type: `EMPLOYMENT_CONTRACT` | `NDA` | `RESIDENTIAL_LEASE` | `OTHER`
- If `OTHER` → return `{ valid: false, reason: "Document type not yet supported. Supported: Employment Contract, NDA, Residential Lease." }`
- Extract **governing law jurisdiction** from the governing law clause (e.g. `"New York, USA"`)
- Extract **party location signals** separately: employer/landlord/disclosing-party address, employee/tenant/receiving-party address, "place of business" references — returned as an array of location strings
- Return `jurisdictionMismatch: true` if governing law jurisdiction differs from any detected party location jurisdiction (e.g. Delaware governing law, California party address)
- Extract section headers and clause boundary map for Pass 2

**Mismatch detection logic (in Pass 1 prompt):**
```
A jurisdiction mismatch exists when:
- The governing law clause names a different state/country than the primary location
  of either party as indicated by their addresses or "place of business" references
- Example: "This agreement shall be governed by the laws of New York" + party address
  in California = MISMATCH
- Example: "This agreement shall be governed by the laws of Delaware" + both parties
  in Delaware = NO mismatch
- When in doubt, flag as mismatch with low confidence rather than miss it
```

**Pass 1 output shape:**
```typescript
interface Pass1Result {
  valid: boolean;
  reason?: string;                        // If invalid, why
  documentType: DocumentType;
  governingLawJurisdiction: string | null; // From the governing law clause
  partyLocations: string[];               // All detected party location signals
  jurisdictionMismatch: boolean;          // true if governing law ≠ party locations
  mismatchConfidence: 'HIGH' | 'LOW' | null; // HIGH = explicit governing law clause found; LOW = inferred
  clauseMap: string[];                    // Section titles / boundaries
}
```

---

### Pass 2 — Full Document Analysis (single call, ~15-25s)

Send the complete document text + Pass 1 results + user-provided jurisdiction (if any) + the document-type-specific prompt template.

Claude returns a structured JSON object covering:

**A. Jurisdiction mismatch finding** *(rendered first, before all clauses, when present)* — if Pass 1 flagged `jurisdictionMismatch: true`, Pass 2 must produce a full mismatch analysis: what the mismatch is, why it matters specifically for this document type, which clauses are most affected, and what the user should do about it.

**B. Clause-by-clause analysis** — for each material clause:
- Plain-English explanation
- Risk level: `RED` | `YELLOW` | `CONTEXT_DEPENDENT` | `GREEN`
- Risk reason (why it's flagged, jurisdiction-aware)
- Comparison to standard for this document type and jurisdiction
- Key obligation in one sentence
- Negotiation language: what to ask for ("Ask them to limit this to 6 months and your specific role")

**C. Missing clauses** — clauses that should typically exist but are absent. Uses the mandatory checklist per document type (see below).

**D. Key dates & deadlines** — all time-based obligations in plain English: notice periods, probation periods, auto-renewal dates, warranty windows, non-compete duration start dates.

**E. Your rights** — what the contract grants the user (not just obligations): termination rights, remedy rights, IP carve-outs, severance entitlements.

**F. Your obligations** — what the user must do: performance obligations, confidentiality scope, notice requirements.

**G. Overall risk score** — 0–100, computed holistically across all clauses (not an average), with label: `"High Risk"` | `"Moderate Risk"` | `"Low Risk"`. A confirmed HIGH-confidence jurisdiction mismatch automatically floors the score at 60 (Moderate Risk minimum).

---

### Pass 3 — Follow-Up Questions (on demand)

After analysis, user can ask up to 3 questions about the document. Each call:
- Sends original document text + full Pass 2 analysis JSON + user's question
- Returns a plain-English answer citing specific clauses
- Rate-limited (shared pool: 3 questions per analysis per IP)

---

### Mandatory Clause Checklist by Document Type

These clauses must always be checked — present or absent — in Pass 2:

**Employment Contract:**
Compensation & benefits, equity/vesting, at-will confirmation, termination for cause vs convenience, severance, non-compete (scope/geography/duration), non-solicitation (employees + customers), IP assignment (including personal time carve-out), moonlighting/outside work restrictions, confidentiality scope, arbitration & class action waiver, governing law & venue, probation period, PTO/vacation policy, expense reimbursement

**NDA:**
Definition of confidential information (breadth), exclusions from confidentiality, permitted disclosures, term & survival period, return/destruction of materials, non-compete (if any), non-solicitation (if any), remedies & injunctive relief, governing law & venue, mutual vs one-sided, residuals clause

**Residential Lease:**
Rent amount & due date, late fees & grace period, security deposit (amount/return timeline/conditions), lease term & auto-renewal, early termination clause, notice requirements, maintenance responsibilities (landlord vs tenant), subletting rights, pet policy, utilities responsibility, entry notice requirements, rent increase provisions, governing law

---

### API Response Shape

```typescript
// lib/types.ts

export type DocumentType = 'EMPLOYMENT_CONTRACT' | 'NDA' | 'RESIDENTIAL_LEASE';
export type RiskLevel = 'RED' | 'YELLOW' | 'CONTEXT_DEPENDENT' | 'GREEN';

export interface JurisdictionMismatch {
  governingLaw: string;            // "New York, USA"
  partyLocations: string[];        // ["California, USA"] — detected party locations
  confidence: 'HIGH' | 'LOW';     // HIGH = explicit governing law clause; LOW = inferred
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  plainEnglish: string;            // "Your contract is governed by New York law, but you appear
                                   //  to be based in California. This matters because..."
  whyItMatters: string;            // Document-type-specific impact explanation
  affectedClauseIds: string[];     // IDs of clauses whose meaning changes due to this mismatch
  whatToAskFor: string;            // "Ask the employer to change the governing law clause to
                                   //  California, or confirm in writing that CA law will apply
                                   //  to your employment relationship."
}

export interface ClauseAnalysis {
  id: string;
  title: string;
  originalExcerpt: string;
  plainEnglish: string;
  riskLevel: RiskLevel;
  riskReason: string;                  // Jurisdiction-aware
  contextNote?: string;                // For CONTEXT_DEPENDENT: what changes the risk
  comparisonToStandard: string;        // "Broader than typical in [jurisdiction] because..."
  obligation: string;
  negotiationTip?: string;             // For RED/YELLOW: what to ask for
  affectedByMismatch?: boolean;        // true if JurisdictionMismatch changes interpretation
}

export interface MissingClause {
  title: string;
  whyItMatters: string;
  whatToAskFor: string;
}

export interface KeyDate {
  label: string;
  value: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface AnalysisResult {
  documentType: DocumentType;
  governingLawJurisdiction: string | null;
  partyLocations: string[];
  userJurisdiction: string | null;
  effectiveJurisdiction: string;        // What was used for clause-level analysis
  jurisdictionMismatch: JurisdictionMismatch | null; // null = no mismatch detected
  overallRiskScore: number;             // 0-100; floored at 60 if HIGH-confidence mismatch
  overallRiskLabel: string;
  redFlagCount: number;
  unusualCount: number;
  contextDependentCount: number;
  standardCount: number;
  clauses: ClauseAnalysis[];
  missingClauses: MissingClause[];
  keyDates: KeyDate[];
  yourRights: string[];
  yourObligations: string[];
  analyzedAt: string;
  followUpQuestionsRemaining: number;
}
```

---

## Legal Disclaimer & Consent Architecture

### Pre-Analysis Disclaimer Gate (mandatory, non-bypassable)

Before any document is submitted for analysis, the user must actively acknowledge a disclaimer. This is a **blocking gate** — not a footer, not a checkbox that can be skipped.

**Disclaimer text (exact, do not abbreviate):**
> "LexLight provides general educational information only — not legal advice. No attorney-client relationship is formed by using this tool. The analysis may contain errors and does not account for all applicable laws. Do not rely on this analysis alone to make legal decisions. For matters of significant consequence, consult a licensed attorney in your jurisdiction."

**Implementation:**
- `DisclaimerGate.tsx` renders as a full-screen overlay on first visit (session-scoped)
- Two actions: "I understand — continue" (proceeds) and "Learn more" (expands explanation)
- Cannot be bypassed by direct URL navigation
- Acknowledgement stored in `sessionStorage` only — re-appears every new browser session
- `AnalyzeButton` is disabled until disclaimer is acknowledged in the current session

---

## Jurisdiction Handling

### Detection (Pass 1)
Pass 1 extracts two distinct things — not one:

**Governing law jurisdiction** — from the explicit governing law clause ("This agreement shall be governed by the laws of..."). This is the jurisdiction that controls how the contract is legally interpreted. Returned as `governingLawJurisdiction`.

**Party locations** — from party addresses, "principal place of business" references, and location-specific terms (e.g. "London office", "California employee"). Returned as `partyLocations[]`. These represent where the contract will actually be *lived* — where the employee works, where the tenant resides, where obligations are performed.

Both are required for mismatch detection. If neither can be extracted, both are null/empty.

### Mismatch Detection
If `governingLawJurisdiction` and any entry in `partyLocations` are in different states or countries, Pass 1 sets `jurisdictionMismatch: true`. Pass 2 then produces a full `JurisdictionMismatch` object.

**Mismatch severity by document type:**
- Employment Contract: always HIGH risk if mismatch — employee-protective laws (non-compete enforceability, wage laws, termination rights) vary dramatically by state
- NDA: MEDIUM risk — confidentiality obligations are generally similar across US states; HIGH risk for US/UK or US/EU cross-border
- Residential Lease: LOW-MEDIUM risk — tenant rights vary by state/city but the governing law clause is less commonly mismatched in leases

### User Input (optional)
`JurisdictionSelector.tsx` below the document input. Label: *"Where will this contract be enforced? (optional but improves accuracy)"* User input is stored as `userJurisdiction` and used as the `effectiveJurisdiction` for clause-level analysis, but does **not** override the mismatch detection — the mismatch is always between what's in the document, regardless of what the user says.

### Effective Jurisdiction Logic
```
effectiveJurisdiction (for clause analysis):
  if (userJurisdiction) → userJurisdiction
  else if (governingLawJurisdiction) → governingLawJurisdiction + note "from governing law clause"
  else if (partyLocations.length > 0) → partyLocations[0] + note "inferred from party address"
  else → "jurisdiction unknown" + prompt user to add their location

mismatch check (always runs independently of effectiveJurisdiction):
  if (governingLawJurisdiction && partyLocations.length > 0)
    && jurisdictions differ → jurisdictionMismatch = true
```

### Jurisdiction-Specific Prompt Injection
Every Pass 2 prompt includes the effective jurisdiction. For known high-impact jurisdictions, inject specific legal context. When a mismatch is present, inject both jurisdictions and their key differences:

```
Governing law: New York, USA
Party location: California, USA
⚠️ JURISDICTION MISMATCH DETECTED
Key difference for employment contracts:
- Non-compete clauses: enforceable in New York (with reasonableness test),
  VOID in California (Bus. & Prof. Code §16600)
- At-will employment: applies in both states
- Wage & hour: California has significantly stronger protections (meal breaks,
  overtime thresholds, final pay timing)
Analyze each clause under New York law (governing), but flag where California
law would give the employee stronger protections that this contract overrides.
```

---

## Privacy Architecture

### What is and is not stored

| Data | Stored? | Where | Duration |
|---|---|---|---|
| Raw PDF binary | Never | — | — |
| Document text | Never | — | — |
| Analysis JSON (shared links only) | Yes | Vercel KV | 24 hours, auto-deleted |
| Anonymous userId (rate limiting) | Yes | Upstash Redis | 24 hours |
| IP address (secondary abuse guard) | Hashed only | Upstash Redis | 24 hours |
| Personal information | Never | — | — |

### Privacy Copy (accurate, not overclaimed)

**Input screen:** *"Your document text is sent to Claude (Anthropic) for analysis and is not stored by LexLight."*

**Results screen:** *"Document text was not stored. Analysis results are stored for 24 hours only if you create a share link, then permanently deleted."*

**Share link modal:** *"This link will work for 24 hours, then expire permanently. The analysis — not your document — is what's stored."*

The phrase "nothing stored" is never used. The accurate claim is "document text is never stored." Share link storage is always disclosed proactively.

---

## UI/UX Specification

### Input Screen Flow
1. Disclaimer gate → user clicks "I understand"
2. Document input — tab: "Paste Text" (CodeMirror 6) | "Upload PDF" (drag-and-drop, pdf.js)
3. Jurisdiction selector — optional, below input
4. Sample documents — three buttons: "Try a sample: NDA / Employment Contract / Lease"
5. Character count + estimated analysis time + 150,000 char limit warning
6. "Analyze Document" CTA — disabled until disclaimer acknowledged and input non-empty

### Loading State (5 stages)
1. "Detecting document type..." (~3s)
2. "Extracting jurisdiction..." (~2s)
3. "Analyzing all clauses together..." (~15-20s)
4. "Checking for missing clauses..." (~3s)
5. "Compiling your report..." (~1s)

### Results Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Employment Contract · Governing law: New York  Overall Risk: 🔴 81 │
│  23 clauses · 3 red flags · 4 unusual · 2 missing               │
└─────────────────────────────────────────────────────────────────┘

┌── ⚠️ Jurisdiction Mismatch Detected ────────────────────────────┐  ← ALWAYS FIRST
│  Governing law: New York · Your location: California             │  if mismatch exists
│                                                                  │
│  This matters: Your contract is governed by New York law, but    │
│  you appear to be based in California. Non-compete clauses are   │
│  generally void in California — but because this contract uses   │
│  New York law, they may be enforceable against you, especially   │
│  if you ever work in or move to New York.                        │
│                                                                  │
│  4 clauses are directly affected by this mismatch. ↓             │
│  Ask for: Change governing law to California, or get written     │
│  confirmation that CA law applies to your employment.            │
└──────────────────────────────────────────────────────────────────┘

[🔴 Red Flags (3)] [🟡 Unusual (4)] [⚪ Context-Dependent (2)] [🟢 Standard (14)]
[📋 Missing (2)]   [📅 Key Dates]   [✅ Your Rights]           [⚠️ Obligations]
[Export ▾]

── Clause Card (affected by mismatch) ─────────────────────────────
🔴 Non-Compete Clause                              ⚠️ Mismatch affected
Plain English: You can't work for any competitor in the US for 2 years
after leaving — even if you're fired.

⚠️ Broader than typical. Under New York law (governing), this is
   enforceable with a reasonableness test. Under California law
   (your location), this would normally be void — but the NY
   governing law clause overrides that protection.

Your obligation: Cannot join competitors for 24 months.
💬 Ask for: "Limit to your specific role and NY state only,
   max 12 months — or change governing law to California."
[View original text ▾]

── Missing Clause ──────────────────────────────────────────────────
⚠️ No Severance Clause
Why it matters: No guaranteed payment if the company lets you go.
Ask for: "2 weeks per year of service, up to 12 weeks maximum."

── Key Dates ───────────────────────────────────────────────────────
🔴 30 days written notice required before resigning
🟡 90-day probation period — standard performance terms apply
🟡 Non-compete starts day of departure, not last day of pay

── Follow-Up ───────────────────────────────────────────────────────
[ Can I do freelance web work on weekends?   ] [Ask →]
  3 questions remaining
```

**Mismatch banner behaviour:**
- Renders immediately below the header, before all clause tabs, whenever `jurisdictionMismatch !== null`
- HIGH-confidence mismatch: solid amber border, full explanation, affected clause count with scroll-to link
- LOW-confidence mismatch: dashed border, shorter text, note: *"We detected a possible mismatch — verify your contract's governing law clause"*
- Affected clause cards show an `⚠️ Mismatch affected` badge in the top-right corner
- `affectedByMismatch: true` clauses are automatically surfaced first within their risk category tab

### Export
- **PDF:** All sections — clauses, missing, dates, rights, obligations — with LexLight branding
- **Markdown:** All sections with risk tags
- **Share Link:** 24hr TTL, stores analysis JSON only, expiry disclosure shown before copy

---

## Rate Limiting

- **Analyses:** 10 per anonymous userId per 24-hour rolling window
- **Follow-up questions:** 10 per analysis (tracked client-side + validated server-side)
- **Share link creation:** Coupled to rate limiter — only if analysis was rate-limit-approved (prevents KV abuse)
- **Keys:** `rate:analyze:${userId}`, `rate:followup:${analysisId}:${userId}`
- **Secondary IP guard:** A loose IP-based ceiling (e.g. 50 analyses/day per hashed IP) runs alongside the userId limit to prevent trivial abuse via localStorage clearing. Key: `rate:ipguard:${hashedIP}`.

### Anonymous userId
- Generated client-side on first visit using `crypto.randomUUID()`
- Persisted in `localStorage` under key `lexlight_uid`; on read failure, fall back to `indexedDB` (object store `lexlight`, key `uid`); on write, mirror to both for resilience
- Sent with every API request in the `x-user-id` header
- Server validates the header is a well-formed UUID v4; if missing/invalid, request is rejected with 400
- No PII, no signup, no signin — userId is opaque and disposable

```typescript
export async function checkRateLimit(
  userId: string,
  ip: string,
  type: 'analyze' | 'followup',
  analysisId?: string
): Promise<{ allowed: boolean; remaining: number }>;
```

---

## Prompt Architecture

All prompts live in `lib/prompts/`. Never inline prompts in API routes.

### Principles
- Always inject effective jurisdiction at the top of Pass 2 prompts
- Always instruct Claude to evaluate clauses holistically, not in isolation
- Always include the mandatory checklist for the document type
- Output must be valid JSON matching `AnalysisResult` — no prose outside JSON
- Include few-shot examples for `CONTEXT_DEPENDENT` classification

### Pass 2 Prompt Structure (employment contract, abbreviated)
```
You are a senior employment lawyer analyzing this contract on behalf of the employee.

Jurisdiction: [effectiveJurisdiction]
Document type: Employment Contract

IMPORTANT: Evaluate clauses holistically. The combined effect of a broad IP
assignment + broad non-compete + mandatory arbitration is far more dangerous
than any clause alone. Reflect this in the overall risk score.

MANDATORY CLAUSES TO CHECK (flag as missing if absent):
[full checklist]

JURISDICTION CONTEXT:
[Known rules for this jurisdiction, e.g. "California: non-competes generally
void under Bus. & Prof. Code §16600"]

RISK LEVELS:
- RED: Significantly favors other party, creates unusual exposure, or broader than standard
- YELLOW: One-sided but not unusual; worth negotiating
- CONTEXT_DEPENDENT: Risk depends on factors not visible in the document
- GREEN: Standard and reasonable for this type and jurisdiction

Output: single valid JSON object matching AnalysisResult schema.

Document:
[full document text]
```

---

## Code Style

TypeScript strict mode. Functional components only. No classes.

```typescript
interface ClauseCardProps {
  clause: ClauseAnalysis;
  jurisdiction: string;
  isExpanded?: boolean;
  onToggle: (id: string) => void;
}

export function ClauseCard({ clause, jurisdiction, isExpanded = false, onToggle }: ClauseCardProps) {
  const riskColors: Record<RiskLevel, string> = {
    RED: 'border-red-500 bg-red-50',
    YELLOW: 'border-yellow-400 bg-yellow-50',
    CONTEXT_DEPENDENT: 'border-gray-400 bg-gray-50',
    GREEN: 'border-green-500 bg-green-50',
  };

  return (
    <div className={`rounded-lg border-l-4 p-4 ${riskColors[clause.riskLevel]}`}>
      {/* ... */}
    </div>
  );
}
```

**Conventions:**
- File names: `PascalCase.tsx` for components, `camelCase.ts` for lib
- One prompt file per document type in `lib/prompts/`
- API routes: validate with Zod, return typed JSON
- No `any` types — use `unknown` and narrow
- Tailwind only — no CSS modules, no inline styles

---

## Testing Strategy

**Framework:** Vitest + React Testing Library (unit/integration), Playwright (e2e). Vitest config uses the `jsdom` environment for component tests and v8 coverage.

**Coverage target:** 80% on `lib/` directory.

```
tests/unit/          → Prompts, rate limit logic, PDF parser, jurisdiction extraction
tests/integration/   → Full 3-pass API flow, follow-up route, share route
e2e/                 → Disclaimer gate, full analyze flow, follow-up, share links
```

**Key things to test:**
- Disclaimer gate blocks analysis if not acknowledged in current session
- Rate limiter blocks after 3 analyses and after 3 follow-up questions per analysis
- Pass 1 rejects non-legal documents and unsupported types with specific messages
- Pass 1 correctly extracts governing law jurisdiction AND party locations as separate fields
- Pass 1 sets `jurisdictionMismatch: true` when governing law ≠ party location state/country
- Pass 1 sets `mismatchConfidence: 'HIGH'` only when an explicit governing law clause is found
- `JurisdictionMismatchBanner` renders above clause tabs when mismatch is present, hidden when null
- HIGH-confidence banner shows full explanation and affected clause count
- LOW-confidence banner shows dashed border and shortened text with verification prompt
- Affected clause cards show `⚠️ Mismatch affected` badge and `affectedByMismatch: true` flag
- HIGH-confidence mismatch floors `overallRiskScore` at minimum 60
- Mismatch `whyItMatters` is document-type-specific (employment vs NDA vs lease)
- User jurisdiction overrides detected jurisdiction in Pass 2 prompt
- `CONTEXT_DEPENDENT` clauses render with gray border and contextNote
- Missing clauses panel renders when `missingClauses.length > 0`
- Follow-up sends full document context + analysis JSON, cites clauses in response
- Share link stores analysis JSON (not document text), returns 404 after 24hr
- Export PDF includes all sections: clauses, missing, dates, rights, obligations

---

## Boundaries

**Always do:**
- Run `bun run type-check && bun run lint && bun run format:check` before any feature is considered done
- Validate all API inputs with Zod before processing
- Hash IPs before using as Redis keys
- Keep all prompt templates in `lib/prompts/` — never inline in routes
- Show DisclaimerGate before any analysis is permitted
- Inject jurisdiction into every Pass 2 prompt (even if "unknown")
- Store only analysis JSON in KV — never document text

**Ask first:**
- Adding any new npm dependency
- Changing the Anthropic model
- Adding a new supported document type (requires new prompt + checklist + test documents)
- Modifying the 3-pass architecture
- Adding server-side storage beyond the 24hr share link KV
- Changing rate limit thresholds
- Modifying the disclaimer text

**Never do:**
- Commit `.env.local` or any file containing `ANTHROPIC_API_KEY`
- Call the Anthropic API from client-side code
- Store raw PDF binary or document text server-side
- Remove or weaken the disclaimer gate
- Remove or weaken the IP rate limiter
- Use `console.log` in production
- Use "nothing stored" in marketing copy — the accurate claim is "document text is never stored"
- Analyze a document without injecting jurisdiction into the Pass 2 prompt

---

## Success Criteria

- [ ] Disclaimer gate appears on every new session and blocks analysis until acknowledged
- [ ] User can paste text and receive full analysis in under 35 seconds
- [ ] User can upload PDF; text extracted client-side via pdf.js, analyzed correctly
- [ ] Jurisdiction selector visible; user jurisdiction overrides detected jurisdiction
- [ ] Pass 1 rejects non-legal documents and unsupported types with friendly, specific messages
- [ ] Pass 1 extracts `governingLawJurisdiction` and `partyLocations` as separate fields
- [ ] Pass 1 correctly flags `jurisdictionMismatch: true` when governing law ≠ party location
- [ ] `JurisdictionMismatchBanner` renders above clause tabs when mismatch is present, absent when null
- [ ] HIGH-confidence banner shows full explanation, affected clause count, and negotiation tip
- [ ] LOW-confidence banner shows dashed border and verification prompt
- [ ] Clause cards affected by mismatch show `⚠️ Mismatch affected` badge
- [ ] HIGH-confidence mismatch floors overall risk score at 60 minimum
- [ ] All four risk levels render correctly: 🔴 RED / 🟡 YELLOW / ⚪ CONTEXT_DEPENDENT / 🟢 GREEN
- [ ] Each clause card shows: plain English, risk badge, jurisdiction-aware reason, comparison to standard, obligation, negotiation tip (RED/YELLOW), original text (collapsible)
- [ ] Missing clauses panel shows absent clauses with "why it matters" and "what to ask for"
- [ ] Key dates panel correctly extracts all time-based obligations
- [ ] Your Rights and Your Obligations panels both render
- [ ] Follow-up question input works; limits to 3; responses cite specific clauses
- [ ] Progress bar shows 5 labeled stages
- [ ] Export: PDF (all sections), Markdown (all sections), share link (24hr, expiry disclosed before copy)
- [ ] Shared link loads for 24 hours then returns 404 cleanly
- [ ] IP rate limits enforce correctly for both analyses and follow-ups
- [ ] Privacy copy accurately reflects what is and is not stored
- [ ] Plausible events: `disclaimer_acknowledged`, `analysis_completed`, `followup_asked`, `export_triggered`
- [ ] Lighthouse ≥ 90 on Performance, Accessibility, Best Practices
- [ ] Zero console errors in production build

**Launch success metrics:**
- Primary: >40% of users who paste/upload complete a full analysis
- Secondary: >20% of completers ask at least one follow-up question

---

## Open Questions

1. **Scanned PDFs:** pdf.js cannot extract text from scanned/image PDFs. v1: show error — *"This PDF appears to be scanned. Please paste the text manually."* OCR via Tesseract.js deferred to v2.

2. **Token limits:** Enforce 150,000 character limit client-side. Show a warning at 120,000 characters. For over-limit documents, prompt user to paste the most critical sections.

3. **Jurisdiction confidence display:** When Pass 1 detects jurisdiction, show: *"Jurisdiction detected from governing law clause — is this correct?"* with a correction option. Low-confidence detections (inferred from addresses only, no explicit governing law clause) should include a warning badge.

4. **Clause detection accuracy:** Budget for a prompt refinement sprint with 20–30 real documents per document type before launch. Key calibration question: does the AI correctly distinguish CONTEXT_DEPENDENT from RED for the same clause in different deal contexts?

5. **Unsupported document types:** When Pass 1 detects an unsupported type, offer: "Vote for this document type" or a waitlist signup. Collect demand data to prioritize v2 additions.

6. **Legal review:** Before launch, have a licensed attorney review the disclaimer text and overall product for UPL (unauthorized practice of law) exposure. The disclaimer gate + "educational information only" framing is standard, but should be confirmed.

7. **Cross-jurisdiction documents:** ✅ Resolved — fully designed. Pass 1 now extracts `governingLawJurisdiction` and `partyLocations` as separate fields and sets `jurisdictionMismatch: true` when they differ. Pass 2 produces a full `JurisdictionMismatch` object with plain-English explanation, `whyItMatters` (document-type-specific), `affectedClauseIds`, and `whatToAskFor`. The `JurisdictionMismatchBanner` component renders above all clause tabs when a mismatch is present. HIGH-confidence mismatches floor the overall risk score at 60. See Jurisdiction Handling section for full detail.