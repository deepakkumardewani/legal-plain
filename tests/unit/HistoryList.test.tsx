import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { HistoryList } from "@/components/history/HistoryList";
import * as useAnalysisHistoryModule from "@/lib/useAnalysisHistory";
import type { AnalysisHistoryEntry } from "@/lib/analysisHistory";
import type { AnalysisResult } from "@/lib/types";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

function makeEntry(id: string): AnalysisHistoryEntry {
  return {
    analysisId: id,
    analysis: {
      documentType: "EMPLOYMENT_CONTRACT",
      overallRiskScore: 30,
      overallRiskLabel: "Low Risk",
      clauses: [],
      missingClauses: [],
      governingLawJurisdiction: null,
    } as unknown as AnalysisResult,
    documentText: "Sample text",
    savedAt: Date.now(),
  };
}

describe("HistoryList", () => {
  const mockHook = {
    entries: [],
    rename: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
    clearAll: vi.fn().mockResolvedValue(undefined),
    reload: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useAnalysisHistoryModule, "useAnalysisHistory").mockReturnValue(mockHook);
  });

  it("shows empty state with CTA when no entries", () => {
    render(<HistoryList />);
    expect(screen.getByText("No analyses yet")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Analyse a document/i })).toBeTruthy();
  });

  it("renders cards for each entry", () => {
    vi.spyOn(useAnalysisHistoryModule, "useAnalysisHistory").mockReturnValue({
      ...mockHook,
      entries: [makeEntry("id-1"), makeEntry("id-2")],
    });

    render(<HistoryList />);
    expect(screen.getByText("2 analyses")).toBeTruthy();
  });

  it("shows correct singular count", () => {
    vi.spyOn(useAnalysisHistoryModule, "useAnalysisHistory").mockReturnValue({
      ...mockHook,
      entries: [makeEntry("id-1")],
    });

    render(<HistoryList />);
    expect(screen.getByText("1 analysis")).toBeTruthy();
  });
});
