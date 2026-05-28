import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RiskDashboard } from "@/components/analysis/RiskDashboard";
import { FollowUpInput } from "@/components/analysis/FollowUpInput";
import { ContradictionsPanel } from "@/components/analysis/ContradictionsPanel";
import { ClauseNavigationProvider } from "@/components/analysis/ClauseNavigationContext";
import type { AnalysisResult } from "@/lib/types";

vi.mock("@/lib/userId", () => ({
  getOrCreateUserId: vi.fn().mockResolvedValue("test-user-id-1234-5678-90ab-cdef12345678"),
}));

const analysis: AnalysisResult = {
  documentType: "NDA",
  governingLawJurisdiction: "Delaware, USA",
  partyLocations: [],
  userJurisdiction: null,
  effectiveJurisdiction: "Delaware, USA",
  jurisdictionMismatch: null,
  overallRiskScore: 50,
  overallRiskLabel: "Moderate Risk",
  redFlagCount: 1,
  unusualCount: 0,
  contextDependentCount: 0,
  standardCount: 1,
  clauses: [
    {
      id: "clause-red",
      title: "Red Flag Item",
      originalExcerpt: "text",
      plainEnglish: "plain",
      riskLevel: "RED",
      riskReason: "reason",
      comparisonToStandard: "standard",
      obligation: "obligation",
    },
    {
      id: "clause-green",
      title: "Standard Item",
      originalExcerpt: "text",
      plainEnglish: "plain",
      riskLevel: "GREEN",
      riskReason: "reason",
      comparisonToStandard: "standard",
      obligation: "obligation",
    },
  ],
  missingClauses: [],
  keyDates: [],
  yourRights: [],
  yourObligations: [],
  contradictions: [
    {
      description: "Conflicting terms",
      clauseIds: ["clause-green"],
    },
  ],
  analyzedAt: "2026-05-18T12:00:00Z",
  analysisId: "660e8400-e29b-41d4-a716-446655440001",
  followUpQuestionsRemaining: 3,
};

function renderResultsStack() {
  return render(
    <ClauseNavigationProvider clauses={analysis.clauses}>
      <RiskDashboard analysis={analysis} />
      <ContradictionsPanel contradictions={analysis.contradictions} />
      <FollowUpInput analysis={analysis} documentText="Contract text." />
    </ClauseNavigationProvider>,
  );
}

describe("clause navigation integration", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        answer: "See [clause-green] for details.",
        citedClauseIds: ["clause-green"],
        remaining: 2,
      }),
    });
  });

  it("switches from RED tab to GREEN when a cross-tab reference is clicked in Q/A", async () => {
    renderResultsStack();

    expect(screen.getByText("Red Flag Item")).toBeTruthy();
    expect(screen.queryByText("Standard Item")).toBeNull();

    fireEvent.change(screen.getByLabelText("Follow-up question"), {
      target: { value: "What about the standard clause?" },
    });
    fireEvent.click(screen.getByText("Ask"));

    await waitFor(() => {
      expect(screen.getAllByText("Standard Item #1").length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getAllByText("Standard Item #1")[0]!);

    await waitFor(() => {
      expect(screen.getByText("Standard Item")).toBeTruthy();
    });
    expect(screen.queryByText("Red Flag Item")).toBeNull();

    const greenCard = document.getElementById("clause-clause-green");
    expect(greenCard?.scrollIntoView).toHaveBeenCalled();
    expect(greenCard?.className).toContain("clause-flash");
  });

  it("navigates from contradictions panel to a clause on another tab", async () => {
    renderResultsStack();

    fireEvent.click(screen.getByText(/See clause clause-green/));

    await waitFor(() => {
      expect(screen.getByText("Standard Item")).toBeTruthy();
    });

    const greenCard = document.getElementById("clause-clause-green");
    expect(greenCard?.scrollIntoView).toHaveBeenCalled();
  });
});
