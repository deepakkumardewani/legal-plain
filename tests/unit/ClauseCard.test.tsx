import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ClauseCard } from "@/components/analysis/ClauseCard";
import type { ClauseAnalysis } from "@/lib/types";

const baseClause: ClauseAnalysis = {
  id: "test-1",
  title: "Test Clause",
  originalExcerpt: "This is the original legal text.",
  plainEnglish: "This is plain English explanation.",
  riskLevel: "RED",
  riskReason: "This clause is risky because...",
  comparisonToStandard: "Standard clauses are more limited.",
  obligation: "You must comply with this clause.",
};

describe("ClauseCard", () => {
  it("renders RED clause with red border and badge", () => {
    render(<ClauseCard clause={baseClause} />);
    expect(screen.getByText("Red Flag")).toBeTruthy();
    expect(screen.getByText("Test Clause")).toBeTruthy();
    expect(screen.getByText("This is plain English explanation.")).toBeTruthy();
  });

  it("renders YELLOW clause with yellow badge", () => {
    render(<ClauseCard clause={{ ...baseClause, riskLevel: "YELLOW" }} />);
    expect(screen.getByText("Unusual")).toBeTruthy();
  });

  it("renders CONTEXT_DEPENDENT clause with gray border and contextNote", () => {
    render(
      <ClauseCard
        clause={{
          ...baseClause,
          riskLevel: "CONTEXT_DEPENDENT",
          contextNote: "This depends on your situation.",
        }}
      />,
    );
    expect(screen.getByText("Context-Dependent")).toBeTruthy();
    expect(screen.getByText("This depends on your situation.")).toBeTruthy();
  });

  it("renders GREEN clause with green badge", () => {
    render(<ClauseCard clause={{ ...baseClause, riskLevel: "GREEN" }} />);
    expect(screen.getByText("Standard")).toBeTruthy();
  });

  it("shows negotiation tip for RED clauses", () => {
    render(<ClauseCard clause={{ ...baseClause, negotiationTip: "Ask for a better deal." }} />);
    expect(screen.getByText(/Ask for a better deal/)).toBeTruthy();
  });

  it("shows negotiation tip for YELLOW clauses", () => {
    render(
      <ClauseCard
        clause={{ ...baseClause, riskLevel: "YELLOW", negotiationTip: "Consider negotiating." }}
      />,
    );
    expect(screen.getByText(/Consider negotiating/)).toBeTruthy();
  });

  it("does not show negotiation tip for GREEN clauses", () => {
    render(
      <ClauseCard clause={{ ...baseClause, riskLevel: "GREEN", negotiationTip: "No need." }} />,
    );
    expect(screen.queryByText(/Negotiation tip/)).toBeNull();
  });

  it("does not show negotiation tip for CONTEXT_DEPENDENT clauses", () => {
    render(
      <ClauseCard
        clause={{
          ...baseClause,
          riskLevel: "CONTEXT_DEPENDENT",
          negotiationTip: "Maybe.",
        }}
      />,
    );
    expect(screen.queryByText(/Negotiation tip/)).toBeNull();
  });

  it("shows affectedByMismatch badge when true", () => {
    render(<ClauseCard clause={{ ...baseClause, affectedByMismatch: true }} />);
    expect(screen.getByText("Mismatch affected")).toBeTruthy();
  });

  it("does not show affectedByMismatch badge when false", () => {
    render(<ClauseCard clause={{ ...baseClause, affectedByMismatch: false }} />);
    expect(screen.queryByText("Mismatch affected")).toBeNull();
  });

  it("toggles original text on button click", () => {
    render(<ClauseCard clause={baseClause} />);
    const button = screen.getByText("View original text");
    expect(screen.queryByText("This is the original legal text.")).toBeNull();

    fireEvent.click(button);
    expect(screen.getByText("This is the original legal text.")).toBeTruthy();
    expect(screen.getByText("Hide original text")).toBeTruthy();

    fireEvent.click(screen.getByText("Hide original text"));
    expect(screen.queryByText("This is the original legal text.")).toBeNull();
  });

  it("renders CompareToStandard section", () => {
    render(<ClauseCard clause={baseClause} />);
    expect(screen.getByText(/Standard clauses are more limited/)).toBeTruthy();
  });

  it("renders obligation text", () => {
    render(<ClauseCard clause={baseClause} />);
    expect(screen.getByText(/You must comply/)).toBeTruthy();
  });
});
