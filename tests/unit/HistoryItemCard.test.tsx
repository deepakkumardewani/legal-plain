import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { HistoryItemCard } from "@/components/history/HistoryItemCard";
import * as analysisHistoryModule from "@/lib/analysisHistory";
import * as analysisStoreModule from "@/lib/useAnalysisStore";
import type { AnalysisHistoryEntry } from "@/lib/analysisHistory";
import type { AnalysisResult } from "@/lib/types";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));

function makeEntry(overrides: Partial<AnalysisHistoryEntry> = {}): AnalysisHistoryEntry {
  return {
    analysisId: "test-id-1",
    analysis: {
      documentType: "NDA",
      overallRiskScore: 75,
      overallRiskLabel: "High Risk",
      clauses: [],
      missingClauses: [],
      governingLawJurisdiction: null,
    } as unknown as AnalysisResult,
    documentText: "Sample document text for testing purposes",
    savedAt: new Date("2024-01-15").getTime(),
    ...overrides,
  };
}

describe("HistoryItemCard", () => {
  const mockSetAnalysis = vi.fn();
  const mockOnRename = vi.fn().mockResolvedValue(undefined);
  const mockOnDelete = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(analysisStoreModule, "useAnalysisStore").mockReturnValue({
      setAnalysis: mockSetAnalysis,
      analysis: null,
      documentText: "",
      clearAnalysis: vi.fn(),
    });
  });

  it("renders auto-label with type and date", () => {
    render(<HistoryItemCard entry={makeEntry()} onRename={mockOnRename} onDelete={mockOnDelete} />);
    expect(screen.getByText(/NDA/)).toBeTruthy();
  });

  it("renders custom name when set", () => {
    render(
      <HistoryItemCard
        entry={makeEntry({ customName: "My Custom Name" })}
        onRename={mockOnRename}
        onDelete={mockOnDelete}
      />,
    );
    expect(screen.getByText("My Custom Name")).toBeTruthy();
  });

  it("renders risk badge label", () => {
    render(<HistoryItemCard entry={makeEntry()} onRename={mockOnRename} onDelete={mockOnDelete} />);
    expect(screen.getByText("High Risk")).toBeTruthy();
  });

  it("reopen calls getAnalysis and setAnalysis then pushes to /results", async () => {
    const entry = makeEntry();
    vi.spyOn(analysisHistoryModule, "getAnalysis").mockResolvedValue(entry);

    render(<HistoryItemCard entry={entry} onRename={mockOnRename} onDelete={mockOnDelete} />);
    fireEvent.click(screen.getByRole("button", { name: /Reopen:/i }));

    await waitFor(() => {
      expect(analysisHistoryModule.getAnalysis).toHaveBeenCalledWith("test-id-1");
      expect(mockSetAnalysis).toHaveBeenCalledWith(entry.analysis, entry.documentText);
      expect(mockPush).toHaveBeenCalledWith("/results");
    });
  });

  it("reopen makes no fetch/api/analyze calls", async () => {
    const entry = makeEntry();
    vi.spyOn(analysisHistoryModule, "getAnalysis").mockResolvedValue(entry);
    const fetchSpy = vi.spyOn(global, "fetch");

    render(<HistoryItemCard entry={entry} onRename={mockOnRename} onDelete={mockOnDelete} />);
    fireEvent.click(screen.getByRole("button", { name: /Reopen:/i }));

    await waitFor(() => expect(mockPush).toHaveBeenCalled());
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
