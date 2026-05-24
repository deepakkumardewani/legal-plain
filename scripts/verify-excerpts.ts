#!/usr/bin/env bun

/**
 * verify-excerpts.ts — Hallucination check for Pass-2 analysis results.
 *
 * Verifies that every non-empty `originalExcerpt` in an AnalysisResult JSON
 * appears verbatim in the source document text. Reports any that don't.
 *
 * Usage:
 *   bun run scripts/verify-excerpts.ts <analysis.json> <source.txt>
 *
 * Exit codes:
 *   0 — All excerpts are verbatim substrings of the source (or all are empty/null).
 *   1 — One or more excerpts could NOT be found verbatim in the source.
 *   2 — Usage error (missing args, unreadable files, invalid JSON).
 *
 * CI-ready: exits non-zero on violations, writes report to stdout.
 */

import { readFileSync } from "node:fs";

// ---- types (minimal subset, matches lib/schemas.ts) ----

interface ClauseAnalysis {
  id: string;
  title: string;
  originalExcerpt: string | null;
}

interface AnalysisResult {
  clauses: ClauseAnalysis[];
}

// ---- main ----

function main(): void {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error("Usage: bun run scripts/verify-excerpts.ts <analysis.json> <source.txt>");
    process.exit(2);
  }

  const [analysisPath, sourcePath] = args;

  let analysis: AnalysisResult;
  let sourceText: string;

  // Read and parse files
  try {
    const raw = readFileSync(analysisPath, "utf-8");
    analysis = JSON.parse(raw) as AnalysisResult;
  } catch (err) {
    console.error(
      `ERROR: Cannot read or parse analysis file "${analysisPath}":`,
      (err as Error).message,
    );
    process.exit(2);
  }

  try {
    sourceText = readFileSync(sourcePath, "utf-8");
  } catch (err) {
    console.error(`ERROR: Cannot read source file "${sourcePath}":`, (err as Error).message);
    process.exit(2);
  }

  if (!Array.isArray(analysis.clauses)) {
    console.error('ERROR: analysis JSON does not contain a "clauses" array.');
    process.exit(2);
  }

  const totalClauses = analysis.clauses.length;
  const violations: Array<{ id: string; title: string; excerpt: string }> = [];
  let emptyCount = 0;

  for (const clause of analysis.clauses) {
    const excerpt = clause.originalExcerpt?.trim() ?? "";

    if (excerpt.length === 0) {
      emptyCount++;
      continue;
    }

    if (!sourceText.includes(excerpt)) {
      violations.push({
        id: clause.id,
        title: clause.title,
        excerpt,
      });
    }
  }

  // Report
  console.log(`\nVerification Report`);
  console.log(`──────────────────`);
  console.log(`Analysis file:  ${analysisPath}`);
  console.log(`Source file:    ${sourcePath}`);
  console.log(`Total clauses:  ${totalClauses}`);
  console.log(`Empty excerpts: ${emptyCount} (skipped)`);
  console.log(`Checked:        ${totalClauses - emptyCount}`);
  console.log(`Violations:     ${violations.length}`);

  if (violations.length > 0) {
    console.log(`\n❌ VIOLATIONS FOUND — these excerpts are NOT verbatim in the source:\n`);
    for (const v of violations) {
      console.log(`  [${v.id}] ${v.title}`);
      console.log(`  Excerpt: "${v.excerpt.slice(0, 120)}${v.excerpt.length > 120 ? "…" : ""}"\n`);
    }
    console.log(`──────────────────`);
    console.log(`Result: FAIL — ${violations.length} hallucinated excerpt(s)\n`);
    process.exit(1);
  }

  console.log(`\n✅ Result: PASS — all excerpts are verbatim substrings of the source.\n`);
  process.exit(0);
}

main();
