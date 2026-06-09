import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  saveAnalysis,
  listAnalyses,
  getAnalysis,
  renameAnalysis,
  deleteAnalysis,
  clearAllAnalyses,
  RETENTION_CAP,
  type AnalysisHistoryEntry,
} from "@/lib/analysisHistory";
import type { AnalysisResult } from "@/lib/types";

function makeEntry(overrides: Partial<AnalysisHistoryEntry> = {}): AnalysisHistoryEntry {
  return {
    analysisId: crypto.randomUUID(),
    analysis: {
      documentType: "NDA",
      overallRiskScore: 50,
      overallRiskLabel: "Moderate Risk",
      clauses: [],
      missingClauses: [],
      governingLawJurisdiction: "CA",
    } as unknown as AnalysisResult,
    documentText: "sample doc text",
    savedAt: Date.now(),
    ...overrides,
  };
}

describe("analysisHistory", () => {
  beforeEach(async () => {
    await clearAllAnalyses();
  });

  it("saves and retrieves an entry", async () => {
    const entry = makeEntry();
    await saveAnalysis(entry);
    const result = await getAnalysis(entry.analysisId);
    expect(result?.analysisId).toBe(entry.analysisId);
  });

  it("listAnalyses returns newest first", async () => {
    const now = Date.now();
    const e1 = makeEntry({ savedAt: now + 1000 });
    const e2 = makeEntry({ savedAt: now + 3000 });
    const e3 = makeEntry({ savedAt: now + 2000 });
    await saveAnalysis(e1);
    await saveAnalysis(e2);
    await saveAnalysis(e3);
    const list = await listAnalyses();
    expect(list.length).toBe(3);
    expect(list[0].savedAt).toBeGreaterThanOrEqual(list[1].savedAt);
    expect(list[1].savedAt).toBeGreaterThanOrEqual(list[2].savedAt);
  });

  it("renameAnalysis updates customName", async () => {
    const entry = makeEntry();
    await saveAnalysis(entry);
    await renameAnalysis(entry.analysisId, "My Contract");
    const result = await getAnalysis(entry.analysisId);
    expect(result?.customName).toBe("My Contract");
  });

  it("renameAnalysis with empty string clears customName", async () => {
    const entry = makeEntry({ customName: "Old Name" });
    await saveAnalysis(entry);
    await renameAnalysis(entry.analysisId, "");
    const result = await getAnalysis(entry.analysisId);
    expect(result?.customName).toBeUndefined();
  });

  it("deleteAnalysis removes the entry", async () => {
    const entry = makeEntry();
    await saveAnalysis(entry);
    await deleteAnalysis(entry.analysisId);
    const result = await getAnalysis(entry.analysisId);
    expect(result).toBeNull();
  });

  it("clearAllAnalyses empties the store", async () => {
    await saveAnalysis(makeEntry());
    await saveAnalysis(makeEntry());
    await clearAllAnalyses();
    const list = await listAnalyses();
    expect(list).toHaveLength(0);
  });

  it("evicts oldest when cap exceeded", async () => {
    const now = Date.now();
    const oldest = makeEntry({ savedAt: now - 100000 });
    await saveAnalysis(oldest);
    for (let i = 0; i < RETENTION_CAP; i++) {
      await saveAnalysis(makeEntry({ savedAt: now + i }));
    }
    const list = await listAnalyses();
    expect(list).toHaveLength(RETENTION_CAP);
    expect(list.find((e) => e.analysisId === oldest.analysisId)).toBeUndefined();
  });
});

describe("analysisHistory SSR guard", () => {
  it("listAnalyses returns empty array when window is undefined", async () => {
    vi.stubGlobal("window", undefined);
    vi.resetModules();
    const ssrMod = await import("@/lib/analysisHistory");
    const list = await ssrMod.listAnalyses();
    expect(list).toEqual([]);
    vi.unstubAllGlobals();
  });
});
