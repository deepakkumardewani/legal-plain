import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { JurisdictionMismatchBanner } from "@/components/analysis/JurisdictionMismatchBanner";
import type { JurisdictionMismatch } from "@/lib/types";

const highMismatch: JurisdictionMismatch = {
  governingLaw: "New York, USA",
  partyLocations: ["California, USA"],
  confidence: "HIGH",
  riskLevel: "HIGH",
  plainEnglish:
    "Your contract is governed by New York law, but you appear to be based in California.",
  whyItMatters: "Employment laws differ significantly between New York and California.",
  affectedClauseIds: ["clause-1", "clause-3"],
  whatToAskFor: "Ask the employer to change the governing law clause to California.",
};

const lowMismatch: JurisdictionMismatch = {
  governingLaw: "Delaware, USA",
  partyLocations: ["Texas, USA"],
  confidence: "LOW",
  riskLevel: "LOW",
  plainEnglish: "Your contract may be governed by a different jurisdiction.",
  whyItMatters: "This could affect your rights if a dispute arises.",
  affectedClauseIds: [],
  whatToAskFor: "",
};

describe("JurisdictionMismatchBanner", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders HIGH confidence banner with solid amber", () => {
    render(<JurisdictionMismatchBanner mismatch={highMismatch} />);

    expect(screen.getByText("Jurisdiction Mismatch Detected")).toBeTruthy();
    expect(screen.getByText(highMismatch.plainEnglish)).toBeTruthy();
    expect(screen.getByText(highMismatch.whyItMatters)).toBeTruthy();
    expect(screen.getByText(/What to ask for/)).toBeTruthy();
    expect(screen.getByText(/Ask the employer/)).toBeTruthy();

    // Should NOT have dashed border — find the outer banner container
    const heading = screen.getByText("Jurisdiction Mismatch Detected");
    const banner = heading.closest('[class*="border-amber-400"]');
    expect(banner).toBeTruthy();
    expect(banner?.className).not.toContain("border-dashed");
  });

  it("renders LOW confidence banner with dashed amber", () => {
    render(<JurisdictionMismatchBanner mismatch={lowMismatch} />);

    expect(screen.getByText("Possible Jurisdiction Mismatch")).toBeTruthy();
    expect(screen.getByText(/Verify your contract's governing law clause/)).toBeTruthy();

    // Should have dashed border
    const heading = screen.getByText("Possible Jurisdiction Mismatch");
    const banner = heading.closest('[class*="border-dashed"]');
    expect(banner).toBeTruthy();
  });

  it("shows affected clause count with scroll link for HIGH", () => {
    render(<JurisdictionMismatchBanner mismatch={highMismatch} />);

    expect(screen.getByText(/2 clauses affected/)).toBeTruthy();
  });

  it("uses singular 'clause' for single affected clause", () => {
    const singleClause = { ...highMismatch, affectedClauseIds: ["clause-1"] };
    render(<JurisdictionMismatchBanner mismatch={singleClause} />);

    expect(screen.getByText(/1 clause affected/)).toBeTruthy();
  });

  it("does not show scroll link when no affected clauses", () => {
    render(<JurisdictionMismatchBanner mismatch={lowMismatch} />);

    expect(screen.queryByText(/clause affected/)).toBeNull();
  });

  it("scrolls to first affected clause on click", () => {
    // Create a mock clause element in the DOM
    const clauseEl = document.createElement("div");
    clauseEl.id = "clause-clause-1";
    clauseEl.scrollIntoView = vi.fn();
    document.body.appendChild(clauseEl);

    render(<JurisdictionMismatchBanner mismatch={highMismatch} />);

    fireEvent.click(screen.getByText(/2 clauses affected/));
    expect(clauseEl.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "center",
    });

    document.body.removeChild(clauseEl);
  });

  it("does not render whatToAskFor section for LOW", () => {
    render(<JurisdictionMismatchBanner mismatch={lowMismatch} />);

    expect(screen.queryByText(/What to ask for/)).toBeNull();
  });
});
