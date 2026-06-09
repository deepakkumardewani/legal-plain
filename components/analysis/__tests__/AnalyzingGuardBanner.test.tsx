import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnalyzingGuardBanner } from "../AnalyzingGuardBanner";

describe("AnalyzingGuardBanner", () => {
  it("renders warning copy", () => {
    render(<AnalyzingGuardBanner />);
    expect(
      screen.getByText(/Analyzing.*please don.*t close, refresh, or leave this page/i),
    ).toBeInTheDocument();
  });

  it("has no dismiss control", () => {
    render(<AnalyzingGuardBanner />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
