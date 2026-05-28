import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ClauseCard } from "@/components/analysis/ClauseCard";
import {
  ClauseNavigationProvider,
  useClauseNav,
} from "@/components/analysis/ClauseNavigationContext";
import type { ClauseAnalysis } from "@/lib/types";

function renderCard(clause: ClauseAnalysis) {
  return render(
    <ClauseNavigationProvider clauses={[clause]}>
      <ClauseCard clause={clause} />
    </ClauseNavigationProvider>,
  );
}

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
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("renders RED clause with red border and badge", () => {
    renderCard(baseClause);
    expect(screen.getByText("Red Flag")).toBeTruthy();
    expect(screen.getByText("Test Clause")).toBeTruthy();
    expect(screen.getByText("This is plain English explanation.")).toBeTruthy();
  });

  it("renders YELLOW clause with yellow badge", () => {
    renderCard({ ...baseClause, riskLevel: "YELLOW" });
    expect(screen.getByText("Unusual")).toBeTruthy();
  });

  it("renders CONTEXT_DEPENDENT clause with gray border and contextNote", () => {
    renderCard({
      ...baseClause,
      riskLevel: "CONTEXT_DEPENDENT",
      contextNote: "This depends on your situation.",
    });
    expect(screen.getByText("Context-Dependent")).toBeTruthy();
    expect(screen.getByText("This depends on your situation.")).toBeTruthy();
  });

  it("renders GREEN clause with green badge", () => {
    renderCard({ ...baseClause, riskLevel: "GREEN" });
    expect(screen.getByText("Standard")).toBeTruthy();
  });

  it("shows negotiation tip for RED clauses", () => {
    renderCard({ ...baseClause, negotiationTip: "Ask for a better deal." });
    expect(screen.getByText(/Ask for a better deal/)).toBeTruthy();
  });

  it("shows negotiation tip for YELLOW clauses", () => {
    renderCard({
      ...baseClause,
      riskLevel: "YELLOW",
      negotiationTip: "Consider negotiating.",
    });
    expect(screen.getByText(/Consider negotiating/)).toBeTruthy();
  });

  it("does not show negotiation tip for GREEN clauses", () => {
    renderCard({ ...baseClause, riskLevel: "GREEN", negotiationTip: "No need." });
    expect(screen.queryByText(/Negotiation tip/)).toBeNull();
  });

  it("does not show negotiation tip for CONTEXT_DEPENDENT clauses", () => {
    renderCard({
      ...baseClause,
      riskLevel: "CONTEXT_DEPENDENT",
      negotiationTip: "Maybe.",
    });
    expect(screen.queryByText(/Negotiation tip/)).toBeNull();
  });

  it("shows affectedByMismatch badge when true", () => {
    renderCard({ ...baseClause, affectedByMismatch: true });
    expect(screen.getByText("Mismatch affected")).toBeTruthy();
  });

  it("does not show affectedByMismatch badge when false", () => {
    renderCard({ ...baseClause, affectedByMismatch: false });
    expect(screen.queryByText("Mismatch affected")).toBeNull();
  });

  it("toggles original text on button click", () => {
    renderCard(baseClause);
    const button = screen.getByText("View original text");
    expect(screen.queryByText("This is the original legal text.")).toBeNull();

    fireEvent.click(button);
    expect(screen.getByText("This is the original legal text.")).toBeTruthy();
    expect(screen.getByText("Hide original text")).toBeTruthy();

    fireEvent.click(screen.getByText("Hide original text"));
    expect(screen.queryByText("This is the original legal text.")).toBeNull();
  });

  it("renders CompareToStandard section", () => {
    renderCard(baseClause);
    expect(screen.getByText(/Standard clauses are more limited/)).toBeTruthy();
  });

  it("renders obligation text", () => {
    renderCard(baseClause);
    expect(screen.getByText(/You must comply/)).toBeTruthy();
  });

  it("applies clause-flash when flashId matches clause id", () => {
    function FlashProbe() {
      const { goToClause } = useClauseNav();
      return (
        <>
          <button type="button" onClick={() => goToClause("test-1")}>
            Flash
          </button>
          <ClauseCard clause={baseClause} />
        </>
      );
    }

    render(
      <ClauseNavigationProvider clauses={[baseClause]}>
        <FlashProbe />
      </ClauseNavigationProvider>,
    );

    fireEvent.click(screen.getByText("Flash"));
    const card = document.getElementById("clause-test-1");
    expect(card?.className).toContain("clause-flash");
  });
});
