import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import {
  ClauseNavigationProvider,
  useClauseNav,
} from "@/components/analysis/ClauseNavigationContext";
import type { ClauseAnalysis } from "@/lib/types";

const clauses: ClauseAnalysis[] = [
  {
    id: "clause-red",
    title: "Red Clause",
    originalExcerpt: "text",
    plainEnglish: "plain",
    riskLevel: "RED",
    riskReason: "reason",
    comparisonToStandard: "standard",
    obligation: "obligation",
  },
  {
    id: "clause-green",
    title: "Green Clause",
    originalExcerpt: "text",
    plainEnglish: "plain",
    riskLevel: "GREEN",
    riskReason: "reason",
    comparisonToStandard: "standard",
    obligation: "obligation",
  },
];

function NavProbe() {
  const { activeTab, flashId, goToClause, goToTab } = useClauseNav();
  return (
    <div>
      <span data-testid="active-tab">{activeTab}</span>
      <span data-testid="flash-id">{flashId ?? ""}</span>
      <button type="button" onClick={() => goToClause("clause-green")}>
        Go green
      </button>
      <button type="button" onClick={() => goToTab("YELLOW")}>
        Go yellow tab
      </button>
      <div id="clause-clause-red">Red card</div>
      <div id="clause-clause-green">Green card</div>
    </div>
  );
}

describe("ClauseNavigationProvider", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("goToClause switches tab and scrolls to the target element", () => {
    render(
      <ClauseNavigationProvider clauses={clauses}>
        <NavProbe />
      </ClauseNavigationProvider>,
    );

    expect(screen.getByTestId("active-tab").textContent).toBe("RED");

    fireEvent.click(screen.getByText("Go green"));

    expect(screen.getByTestId("active-tab").textContent).toBe("GREEN");

    const greenEl = document.getElementById("clause-clause-green");
    expect(greenEl?.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "center",
    });
    expect(screen.getByTestId("flash-id").textContent).toBe("clause-green");
  });

  it("clears flashId after the flash duration", () => {
    render(
      <ClauseNavigationProvider clauses={clauses}>
        <NavProbe />
      </ClauseNavigationProvider>,
    );

    fireEvent.click(screen.getByText("Go green"));
    expect(screen.getByTestId("flash-id").textContent).toBe("clause-green");

    act(() => {
      vi.advanceTimersByTime(1600);
    });

    expect(screen.getByTestId("flash-id").textContent).toBe("");
  });

  it("goToTab changes active tab without scrolling", () => {
    render(
      <ClauseNavigationProvider clauses={clauses}>
        <NavProbe />
      </ClauseNavigationProvider>,
    );

    fireEvent.click(screen.getByText("Go yellow tab"));
    expect(screen.getByTestId("active-tab").textContent).toBe("YELLOW");
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });
});
