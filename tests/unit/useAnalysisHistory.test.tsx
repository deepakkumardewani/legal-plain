import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAnalysisHistory } from "@/lib/useAnalysisHistory";
import { saveAnalysis, clearAllAnalyses, type AnalysisHistoryEntry } from "@/lib/analysisHistory";
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
    documentText: "test doc",
    savedAt: Date.now(),
    ...overrides,
  };
}

describe("useAnalysisHistory", () => {
  beforeEach(async () => {
    await clearAllAnalyses();
  });

  it("loads seeded records on mount", async () => {
    const entry = makeEntry();
    await saveAnalysis(entry);

    const { result } = renderHook(() => useAnalysisHistory());
    await waitFor(() =>
      expect(result.current.entries.some((e) => e.analysisId === entry.analysisId)).toBe(true),
    );
  });

  it("remove updates list without manual refresh", async () => {
    const entry = makeEntry();
    await saveAnalysis(entry);

    const { result } = renderHook(() => useAnalysisHistory());
    await waitFor(() => expect(result.current.entries).toHaveLength(1));

    await act(async () => {
      await result.current.remove(entry.analysisId);
    });

    expect(result.current.entries).toHaveLength(0);
  });

  it("rename updates list without manual refresh", async () => {
    const entry = makeEntry();
    await saveAnalysis(entry);

    const { result } = renderHook(() => useAnalysisHistory());
    await waitFor(() => expect(result.current.entries).toHaveLength(1));

    await act(async () => {
      await result.current.rename(entry.analysisId, "Renamed");
    });

    const updated = result.current.entries.find((e) => e.analysisId === entry.analysisId);
    expect(updated?.customName).toBe("Renamed");
  });

  it("clearAll empties entries", async () => {
    await saveAnalysis(makeEntry());
    await saveAnalysis(makeEntry());

    const { result } = renderHook(() => useAnalysisHistory());
    await waitFor(() => expect(result.current.entries).toHaveLength(2));

    await act(async () => {
      await result.current.clearAll();
    });

    expect(result.current.entries).toHaveLength(0);
  });
});
