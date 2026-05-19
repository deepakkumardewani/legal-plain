import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CategoryTabs } from "@/components/analysis/CategoryTabs";

describe("CategoryTabs", () => {
  const defaultProps = {
    activeTab: "RED" as const,
    onTabChange: vi.fn(),
    redFlagCount: 3,
    unusualCount: 2,
    contextDependentCount: 1,
    standardCount: 5,
  };

  it("renders all four tabs with counts", () => {
    render(<CategoryTabs {...defaultProps} />);
    expect(screen.getByText("Red Flags")).toBeTruthy();
    expect(screen.getByText("Unusual")).toBeTruthy();
    expect(screen.getByText("Context-Dependent")).toBeTruthy();
    expect(screen.getByText("Standard")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getByText("5")).toBeTruthy();
  });

  it("marks active tab as selected", () => {
    render(<CategoryTabs {...defaultProps} />);
    const redTab = screen.getByRole("tab", { name: /Red Flags/ });
    expect(redTab.getAttribute("aria-selected")).toBe("true");
  });

  it("calls onTabChange when clicking a tab", () => {
    const onTabChange = vi.fn();
    render(<CategoryTabs {...defaultProps} onTabChange={onTabChange} />);

    fireEvent.click(screen.getByRole("tab", { name: /Standard/ }));
    expect(onTabChange).toHaveBeenCalledWith("GREEN");
  });

  it("has tablist role", () => {
    render(<CategoryTabs {...defaultProps} />);
    expect(screen.getByRole("tablist")).toBeTruthy();
  });
});
