---
name: LexLight
colors:
  background: "#faf9f6"
  surface: "#ffffff"
  surface-warm: "#f5f0e8"
  surface-dim: "#ede8e0"
  primary: "#0e0f16"
  on-primary: "#faf9f6"
  accent: "#c8791a"
  accent-light: "#efcfa2"
  accent-dim: "#f7efe2"
  on-accent: "#ffffff"
  secondary: "#4a4a52"
  on-surface: "#0e0f16"
  on-surface-variant: "#5c5c66"
  muted: "#737373"
  muted-bg: "#f5f5f5"
  outline: "#e5e5e5"
  outline-warm: "#ddd5c8"
  error: "#c0392b"
  error-surface: "#fdf2f0"
  success: "#2d6a4f"
  success-surface: "#edf7f2"
  warning: "#b45309"
  warning-surface: "#fef9ee"

typography:
  display-lg:
    fontFamily: "Bricolage Grotesque"
    fontSize: 72px
    fontWeight: "700"
    lineHeight: 78px
    letterSpacing: -0.03em
  display-md:
    fontFamily: "Bricolage Grotesque"
    fontSize: 52px
    fontWeight: "700"
    lineHeight: 58px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: "Bricolage Grotesque"
    fontSize: 36px
    fontWeight: "600"
    lineHeight: 44px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: "Bricolage Grotesque"
    fontSize: 26px
    fontWeight: "600"
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: "Bricolage Grotesque"
    fontSize: 20px
    fontWeight: "600"
    lineHeight: 28px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: "Barlow"
    fontSize: 18px
    fontWeight: "400"
    lineHeight: 28px
    letterSpacing: 0em
  body-md:
    fontFamily: "Barlow"
    fontSize: 15px
    fontWeight: "400"
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: "Barlow"
    fontSize: 13px
    fontWeight: "400"
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: "Barlow"
    fontSize: 13px
    fontWeight: "500"
    lineHeight: 18px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: "Barlow"
    fontSize: 11px
    fontWeight: "500"
    lineHeight: 16px
    letterSpacing: 0.04em

rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px

spacing:
  unit: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
  container-padding: 24px
  card-gap: 16px
  card-padding: 24px
  section-margin: 80px
  clause-indent: 20px

components:
  card-standard:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.outline}"
    borderWidth: 1px
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card-padding}"
    shadow: "0 1px 4px rgba(14, 15, 22, 0.06)"

  card-warm:
    backgroundColor: "{colors.surface-warm}"
    borderColor: "{colors.outline-warm}"
    borderWidth: 1px
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card-padding}"

  card-clause:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.outline}"
    borderLeftColor: "{colors.accent}"
    borderLeftWidth: 3px
    borderWidth: 1px
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.card-padding}"
    shadow: "0 1px 3px rgba(14, 15, 22, 0.05)"

  card-clause-risk:
    backgroundColor: "{colors.error-surface}"
    borderColor: "#f5c6be"
    borderLeftColor: "{colors.error}"
    borderLeftWidth: 3px
    borderWidth: 1px
    rounded: "{rounded.md}"
    padding: "{spacing.card-padding}"

  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.DEFAULT}"
    height: 44px
    padding: 0 20px
    fontFamily: "Barlow"
    fontSize: 14px
    fontWeight: "500"
    letterSpacing: 0.01em

  button-primary-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.DEFAULT}"

  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.DEFAULT}"
    height: 44px
    padding: 0 20px

  button-ghost:
    backgroundColor: "transparent"
    borderColor: "{colors.outline}"
    borderWidth: 1px
    textColor: "{colors.on-surface}"
    rounded: "{rounded.DEFAULT}"
    height: 44px
    padding: 0 20px

  button-ghost-hover:
    backgroundColor: "{colors.surface-warm}"
    borderColor: "{colors.outline-warm}"

  input-field:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.outline}"
    borderWidth: 1px
    textColor: "{colors.on-surface}"
    placeholderColor: "{colors.muted}"
    rounded: "{rounded.DEFAULT}"
    height: 44px
    padding: 0 14px
    fontSize: 15px
    focusBorderColor: "{colors.accent}"
    focusRingColor: "rgba(200, 121, 26, 0.15)"

  badge-risk-high:
    backgroundColor: "{colors.error-surface}"
    textColor: "{colors.error}"
    borderColor: "#f5c6be"
    borderWidth: 1px
    rounded: "{rounded.sm}"
    padding: 2px 8px
    fontFamily: "Barlow"
    fontSize: 11px
    fontWeight: "600"
    letterSpacing: 0.04em

  badge-risk-medium:
    backgroundColor: "{colors.warning-surface}"
    textColor: "{colors.warning}"
    borderColor: "#f9d8a0"
    borderWidth: 1px
    rounded: "{rounded.sm}"
    padding: 2px 8px
    fontFamily: "Barlow"
    fontSize: 11px
    fontWeight: "600"

  badge-risk-low:
    backgroundColor: "{colors.success-surface}"
    textColor: "{colors.success}"
    borderColor: "#b8dccb"
    borderWidth: 1px
    rounded: "{rounded.sm}"
    padding: 2px 8px
    fontFamily: "Barlow"
    fontSize: 11px
    fontWeight: "600"

  upload-zone:
    backgroundColor: "{colors.surface-warm}"
    borderColor: "{colors.outline-warm}"
    borderStyle: dashed
    borderWidth: 2px
    rounded: "{rounded.lg}"
    padding: 48px 32px
    hoverBorderColor: "{colors.accent}"
    hoverBackgroundColor: "{colors.accent-dim}"

  section-divider:
    color: "{colors.outline}"
    thickness: 1px
    margin: "{spacing.xl} 0"
---

## Brand & Style

LexLight is a protective utility for people who need to understand contracts but don't have a lawyer. The interface serves non-lawyers — stressed first-time renters, freelancers reviewing client agreements, employees receiving employment contracts — who arrive anxious and need to leave feeling safe. The visual language is **calm utility**: every decision earns its place by serving comprehension or trust, never novelty. Think of the best reference books, a quality archivist's desk, a well-made magnifying glass — functional beauty where the tool disappears into the task. The brand is Light mode by default; people read documents during the day, under time pressure, and light reads as clear, honest, and unhurried. The emotional target after completing an analysis: *"It caught something I would have missed."*

## Colors

The palette is built from warm neutrals anchored by a near-black hero and a single warm orange accent. **Warm Off-White** (`#faf9f6`) is the main background — not pure white, but slightly warm, reducing eye strain for users reading dense contract text. **Surface Warm** (`#f5f0e8`) provides a secondary level for cards and containers that need a gentle visual step without a full border. **Primary Near-Black** (`#0e0f16`) is used for the hero, primary navigation, and body text — it reads as ink, not screen, keeping the document-reading metaphor intact.

The single accent, **Warm Orange** (`#c8791a`), is used sparingly: primary CTAs, active states, risk indicator left-borders, and focused inputs. Its muted companion **Accent Light** (`#efcfa2`) and `accent-dim` (`#f7efe2`) allow the orange to appear in surfaces and backgrounds without overpowering. Semantic colors (error, success, warning) are muted and warm-adjacent — not bright primary red/green — because the analysis results need to feel informative, not alarming. Privacy and neutrality are built into the palette's restraint.

## Typography

**Bricolage Grotesque** carries all display and headline levels. It is a variable-width grotesque with subtle character — not a sterile sans-serif, not a tech startup font. At display sizes it commands authority; at headline sizes it remains approachable. Used for section headings, clause titles, and the hero statement.

**Barlow** handles all body text, labels, and UI chrome. It is highly legible at small sizes, neutral, and optimized for dense reading — critical when users are parsing clause excerpts. The `body-lg` (18px / 28px line-height) is for primary reading content; `body-md` (15px) for secondary text and card metadata; `label-sm` (11px, tracked out at 0.04em) for badges, chips, and status tags. Display levels use negative letter-spacing to keep headings optically tight; labels use positive spacing to keep small text readable at arm's length.

## Layout & Spacing

The grid uses an 8px base unit (`spacing.unit`). All spacing values are multiples of 8 to maintain vertical rhythm across nested components. `container-padding` is 24px on mobile and expands to 48px+ on desktop. `section-margin` (80px) creates generous breathing room between page sections — the white space communicates "we are not rushed." `card-padding` (24px) gives content room to breathe inside cards so users aren't reading in cramped boxes. `clause-indent` (20px) creates visual hierarchy within clause cards when sub-points are shown.

## Elevation & Depth

Hierarchy is conveyed through **tonal stepping**, not dramatic shadows. The stack from bottom to top: `background` (#faf9f6) → `surface-warm` (#f5f0e8) → `surface` (#ffffff) with a 1px `outline` border → `card-standard` with a soft `0 1px 4px rgba(14,15,22,0.06)` shadow. This is a shallow stack — nothing floats aggressively. Modals and focused panels may use `0 8px 24px rgba(14,15,22,0.1)` but never heavier. The goal is a document desk metaphor: papers laid flat, with gentle separation between layers.

## Shapes

Corners are consistently **soft-functional**: `DEFAULT` (8px / 0.5rem) for buttons and inputs; `md` (12px) for result panels and clause cards; `lg` (16px) for larger content cards and the upload zone. Nothing exceeds 24px except pill badges and toggles (`full: 9999px`). This restraint keeps the interface reading as a tool, not a consumer app. Sharp 0px corners are intentionally avoided — they carry law-firm formality the brand rejects.

## Components

**card-clause** is the primary result atom — a white card with a 3px left accent border that visually codes the clause type (orange for flagged, red for high-risk). This border pattern is the signature UI device for the analysis results page. **card-clause-risk** applies error surface and red border for truly flagged clauses; use it when the risk level warrants immediate attention.

**upload-zone** uses a dashed warm border on `surface-warm` background — the dashed style signals "drop something here" without being garish. On hover, the border becomes the full accent orange and the background shifts to `accent-dim`.

**button-primary** uses the near-black `primary` as default state; on hover, it transitions to `accent` orange. This hover behavior provides a moment of warmth — the tool is working for you. **button-ghost** is for secondary actions, using only an outline border and transparent fill; it never competes with primary.

**Risk badges** (high / medium / low) use muted semantic surface colors with matching text and border — never saturated primary red or green. The badge typography uses `label-sm` with 0.04em tracking to ensure legibility at 11px.
