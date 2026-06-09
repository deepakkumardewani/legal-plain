import { test, expect, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds a minimal but structurally valid PDF buffer.
 * The content stream uses Helvetica (a standard Type1 PDF font) so pdfjs-dist
 * can extract text without needing an embedded font program.
 * Text is > 100 chars to pass the MIN_TEXT_LENGTH guard in pdfParser.ts.
 */
function buildTestPdf(): Buffer {
  const text =
    "(This is a test employment contract document for LegalPlain E2E testing. " +
    "It contains test clauses and conditions for automated end-to-end verification purposes only.)";
  const stream = `BT /F1 12 Tf 72 720 Td ${text} Tj ET`;

  const header = "%PDF-1.4\n";
  const obj1 = "1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n";
  const obj2 = "2 0 obj\n<</Type/Pages/Kids[3 0 R]/Count 1>>\nendobj\n";
  const obj3 =
    "3 0 obj\n<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]" +
    "/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>\nendobj\n";
  const obj4 = `4 0 obj\n<</Length ${stream.length}>>\nstream\n${stream}\nendstream\nendobj\n`;
  const obj5 = "5 0 obj\n<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>\nendobj\n";

  // Calculate byte offsets for the cross-reference table.
  let pos = header.length;
  const o1 = pos;
  pos += obj1.length;
  const o2 = pos;
  pos += obj2.length;
  const o3 = pos;
  pos += obj3.length;
  const o4 = pos;
  pos += obj4.length;
  const o5 = pos;
  pos += obj5.length;
  const xrefPos = pos;

  const pad = (n: number) => n.toString().padStart(10, "0");

  const xref =
    "xref\n" +
    "0 6\n" +
    "0000000000 65535 f \n" +
    `${pad(o1)} 00000 n \n` +
    `${pad(o2)} 00000 n \n` +
    `${pad(o3)} 00000 n \n` +
    `${pad(o4)} 00000 n \n` +
    `${pad(o5)} 00000 n \n` +
    "trailer\n<</Size 6/Root 1 0 R>>\n" +
    `startxref\n${xrefPos}\n%%EOF`;

  return Buffer.from(header + obj1 + obj2 + obj3 + obj4 + obj5 + xref);
}

/** Minimal AnalysisResult fixture returned by the mocked /api/analyze. */
const FIXTURE_ANALYSIS = {
  documentType: "EMPLOYMENT_CONTRACT",
  governingLawJurisdiction: null,
  partyLocations: [],
  userJurisdiction: null,
  effectiveJurisdiction: "Unknown",
  jurisdictionMismatch: null,
  overallRiskScore: 3,
  overallRiskLabel: "Moderate Risk",
  redFlagCount: 1,
  unusualCount: 1,
  contextDependentCount: 0,
  standardCount: 1,
  clauses: [
    {
      id: "c1",
      title: "Termination Without Cause",
      originalExcerpt: "Employer may terminate at will.",
      plainEnglish: "They can fire you at any time.",
      riskLevel: "RED",
      riskReason: "No severance protection.",
      comparisonToStandard: "Below standard.",
      obligation: "Employee must comply.",
    },
  ],
  missingClauses: [],
  keyDates: [],
  yourRights: ["Right to fair pay"],
  yourObligations: ["Show up to work"],
  analysisId: "e2e-analysis-001",
  analyzedAt: new Date().toISOString(),
  followUpQuestionsRemaining: 3,
};

/** Two history entries used for the history-flow test. */
const ENTRY_1 = {
  analysisId: "e2e-history-001",
  analysis: {
    ...FIXTURE_ANALYSIS,
    analysisId: "e2e-history-001",
    documentType: "EMPLOYMENT_CONTRACT",
  },
  documentText: "This is a test employment contract for end-to-end history testing.",
  savedAt: Date.now() - 120_000, // 2 minutes ago (older)
};

const ENTRY_2 = {
  analysisId: "e2e-history-002",
  analysis: {
    ...FIXTURE_ANALYSIS,
    analysisId: "e2e-history-002",
    documentType: "NDA",
    overallRiskScore: 1,
    overallRiskLabel: "Low Risk",
    redFlagCount: 0,
  },
  documentText: "This is a test NDA for end-to-end history testing.",
  savedAt: Date.now() - 60_000, // 1 minute ago (newer)
};

/** Seeds the app's IndexedDB (legalplain / analysis_history) from the browser context. */
async function seedIndexedDB(page: Page, entries: (typeof ENTRY_1)[]): Promise<void> {
  await page.evaluate(async (rows) => {
    await new Promise<void>((resolve, reject) => {
      const req = indexedDB.open("legalplain", 2);

      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("analysis_history")) {
          const store = db.createObjectStore("analysis_history", {
            keyPath: "analysisId",
          });
          store.createIndex("savedAt", "savedAt", { unique: false });
        }
      };

      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction("analysis_history", "readwrite");
        const store = tx.objectStore("analysis_history");
        for (const row of rows) store.put(row);
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
      };

      req.onerror = () => reject(req.error);
    });
  }, entries);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe("Analysis history & guard", () => {
  test.beforeEach(async ({ page }) => {
    // Bypass the disclaimer gate (uses sessionStorage) for every test.
    await page.addInitScript(() => {
      sessionStorage.setItem("legalplain_disclaimer", "ack");
    });
  });

  // -------------------------------------------------------------------------
  // E1-A: Guard banner appears during analysis → results → /history entry saved
  // -------------------------------------------------------------------------
  test("guard banner shows during analysis and entry appears in history", async ({ page }) => {
    let analyzeCallCount = 0;

    // Mock /api/analyze with a delay so the guard banner is observable.
    await page.route("**/api/analyze", async (route) => {
      analyzeCallCount++;
      await new Promise<void>((r) => setTimeout(r, 600));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(FIXTURE_ANALYSIS),
      });
    });

    await page.goto("/analyze");

    // Upload test PDF via the hidden file input.
    const pdfBuffer = buildTestPdf();
    await page.setInputFiles('input[type="file"][accept="application/pdf"]', {
      name: "test-contract.pdf",
      mimeType: "application/pdf",
      buffer: pdfBuffer,
    });

    // Wait for pdfjs-dist to extract text (loaded-doc card appears).
    await expect(page.getByText("ready to analyze")).toBeVisible({
      timeout: 15_000,
    });

    // Select document type.
    await page.getByRole("button", { name: /Employment Contract/i }).click();

    // Wait for the analyze button to become enabled (userId resolves from IndexedDB).
    const analyzeBtn = page.getByLabel("Analyze document");
    await expect(analyzeBtn).toBeEnabled({ timeout: 8_000 });

    // Start analysis.
    await analyzeBtn.click();

    // Guard banner must be visible while the API is pending.
    await expect(page.getByRole("status")).toBeVisible({ timeout: 3_000 });
    await expect(page.getByText(/don.t close/i)).toBeVisible();

    // Analysis completes → app navigates to /results.
    await page.waitForURL("**/results", { timeout: 15_000 });
    expect(analyzeCallCount).toBe(1);

    // Navigate to /history — entry must be saved.
    await page.getByRole("link", { name: "History" }).first().click();
    await page.waitForURL("**/history");
    await expect(page.getByText("1 analysis")).toBeVisible({ timeout: 5_000 });
  });

  // -------------------------------------------------------------------------
  // E1-B: History list → reopen (no API) → rename → delete → clear all → empty
  // -------------------------------------------------------------------------
  test("reopen makes no API call; rename, delete, and clear all work", async ({ page }) => {
    // Land on the app to establish the correct origin, then seed storage.
    await page.goto("/analyze");
    await seedIndexedDB(page, [ENTRY_1, ENTRY_2]);

    await page.goto("/history");

    // Two entries should be visible (newest first).
    await expect(page.getByText("2 analyses")).toBeVisible({ timeout: 5_000 });

    // ── Reopen: assert zero calls to /api/analyze ──────────────────────────
    const analyzeRequests: string[] = [];
    await page.route("**/api/analyze", (route) => {
      analyzeRequests.push(route.request().url());
      route.abort(); // prevent any accidental real call
    });

    // First card (newest) is ENTRY_2 (NDA).
    await page
      .getByLabel(/^Reopen:/)
      .first()
      .click();
    await page.waitForURL("**/results", { timeout: 10_000 });
    expect(analyzeRequests).toHaveLength(0);

    // ── Back to history ────────────────────────────────────────────────────
    await page.goto("/history");
    await expect(page.getByText("2 analyses")).toBeVisible({ timeout: 5_000 });

    // ── Rename first card (ENTRY_2 / NDA) ─────────────────────────────────
    await page.getByRole("button", { name: "More options" }).first().click();
    await page.getByRole("menuitem", { name: "Rename" }).click();

    const renameInput = page.getByLabel("Rename analysis");
    await renameInput.fill("My Custom NDA");
    await renameInput.press("Enter");

    await expect(page.getByText("My Custom NDA")).toBeVisible({
      timeout: 3_000,
    });

    // ── Delete the renamed first card ("My Custom NDA") ────────────────────
    // Re-open "More options" on the first card (same card, now showing the
    // DropdownMenu trigger again after rename committed).
    await page.getByRole("button", { name: "More options" }).first().click();
    await page.getByRole("menuitem", { name: "Delete" }).click();

    // One entry remains (ENTRY_1 / Employment Contract).
    await expect(page.getByText("1 analysis")).toBeVisible({ timeout: 3_000 });

    // ── Clear all → confirm → empty state ─────────────────────────────────
    await page.getByRole("button", { name: "Clear all" }).click();
    // Confirm dialog: "Clear all" button inside the dialog
    await page.getByRole("button", { name: "Clear all" }).last().click();

    await expect(page.getByText("No analyses yet")).toBeVisible({
      timeout: 5_000,
    });
    await expect(page.getByRole("link", { name: /Analyse a document/i })).toBeVisible();
  });
});
