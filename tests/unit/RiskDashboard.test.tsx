import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { RiskDashboard } from "@/components/analysis/RiskDashboard";
import type { AnalysisResult } from "@/lib/types";

const mockAnalysis: AnalysisResult = {
  documentType: "EMPLOYMENT_CONTRACT",
  governingLawJurisdiction: "New York, USA",
  partyLocations: ["California, USA"],
  userJurisdiction: null,
  effectiveJurisdiction: "New York, USA",
  jurisdictionMismatch: null,
  overallRiskScore: 75,
  overallRiskLabel: "Moderate Risk",
  redFlagCount: 1,
  unusualCount: 1,
  contextDependentCount: 1,
  standardCount: 1,
  clauses: [
    {
      id: "c1",
      title: "Non-Compete",
      originalExcerpt: "You shall not compete.",
      plainEnglish: "No competing.",
      riskLevel: "RED",
      riskReason: "Too broad.",
      comparisonToStandard: "Standard is narrower.",
      obligation: "Do not compete.",
      negotiationTip: "Narrow the scope.",
      affectedByMismatch: true,
    },
    {
      id: "c2",
      title: "IP Clause",
      originalExcerpt: "All IP belongs to us.",
      plainEnglish: "We own everything.",
      riskLevel: "YELLOW",
      riskReason: "Slightly broad.",
      comparisonToStandard: "Standard has carve-outs.",
      obligation: "Assign IP.",
      affectedByMismatch: false,
    },
    {
      id: "c3",
      title: "Severance",
      originalExcerpt: "Severance at discretion.",
      plainEnglish: "We decide severance.",
      riskLevel: "CONTEXT_DEPENDENT",
      riskReason: "Depends on company.",
      comparisonToStandard: "Standard has formula.",
      obligation: "No guaranteed severance.",
      contextNote: "Ask for a formula.",
      affectedByMismatch: false,
    },
    {
      id: "c4",
      title: "At-Will",
      originalExcerpt: "Employment is at-will.",
      plainEnglish: "Either party can terminate.",
      riskLevel: "GREEN",
      riskReason: "Standard clause.",
      comparisonToStandard: "This is standard.",
      obligation: "At-will termination.",
      affectedByMismatch: false,
    },
  ],
  missingClauses: [],
  keyDates: [],
  yourRights: [],
  yourObligations: [],
  analyzedAt: "2026-05-18T12:00:00Z",
  followUpQuestionsRemaining: 3,
};

describe("RiskDashboard", () => {
  it("renders document type and governing law", () => {
    render(<RiskDashboard analysis={mockAnalysis} />);
    expect(screen.getByText("Analysis Results")).toBeTruthy();
    const subtitle = screen.getByText(/Employment Contract/);
    expect(subtitle).toBeTruthy();
    expect(subtitle.textContent).toContain("New York, USA");
  });

  it("renders overall risk score and label", () => {
    render(<RiskDashboard analysis={mockAnalysis} />);
    const scores = screen.getAllByText("75");
    expect(scores.length).toBeGreaterThan(0);
    expect(screen.getByText("Moderate Risk")).toBeTruthy();
  });

  it("renders all count badges with correct labels", () => {
    render(<RiskDashboard analysis={mockAnalysis} />);
    // CountBadge and CategoryTab labels may appear multiple times for same text
    expect(screen.getAllByText("Red Flags").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Unusual").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Context")).toBeTruthy();
  });

  it("shows RED clauses by default", () => {
    render(<RiskDashboard analysis={mockAnalysis} />);
    expect(screen.getByText("Non-Compete")).toBeTruthy();
    expect(screen.queryByText("At-Will")).toBeNull();
  });

  it("switches tabs to show GREEN clauses", () => {
    render(<RiskDashboard analysis={mockAnalysis} />);
    const standardTabs = screen.getAllByRole("tab", { name: /Standard/ });
    fireEvent.click(standardTabs[0]!);
    expect(screen.getByText("At-Will")).toBeTruthy();
    expect(screen.queryByText("Non-Compete")).toBeNull();
  });

  it("sorts affectedByMismatch clauses first in RED tab", () => {
    const twoRed: AnalysisResult = {
      ...mockAnalysis,
      redFlagCount: 2,
      clauses: [
        {
          id: "c-nomismatch",
          title: "Second Red",
          originalExcerpt: "text",
          plainEnglish: "plain",
          riskLevel: "RED",
          riskReason: "reason",
          comparisonToStandard: "standard",
          obligation: "obligation",
          affectedByMismatch: false,
        },
        {
          id: "c-mismatch",
          title: "First Red (mismatch)",
          originalExcerpt: "text",
          plainEnglish: "plain",
          riskLevel: "RED",
          riskReason: "reason",
          comparisonToStandard: "standard",
          obligation: "obligation",
          affectedByMismatch: true,
        },
        ...mockAnalysis.clauses.filter((c) => c.riskLevel !== "RED"),
      ],
    };

    render(<RiskDashboard analysis={twoRed} />);
    const clauseCards = document.querySelectorAll("[id^='clause-']");
    const cardIds = Array.from(clauseCards).map((el) => el.id);
    const mismatchIdx = cardIds.indexOf("clause-c-mismatch");
    const noMismatchIdx = cardIds.indexOf("clause-c-nomismatch");
    expect(mismatchIdx).toBeLessThan(noMismatchIdx);
  });

  it("shows empty state when no clauses in category", () => {
    const noYellow: AnalysisResult = {
      ...mockAnalysis,
      unusualCount: 0,
      clauses: mockAnalysis.clauses.filter((c) => c.riskLevel !== "YELLOW"),
    };
    render(<RiskDashboard analysis={noYellow} />);
    const unusualTabs = screen.getAllByRole("tab", { name: /Unusual/ });
    fireEvent.click(unusualTabs[0]!);
    expect(screen.getByText("No clauses in this category.")).toBeTruthy();
  });
});
