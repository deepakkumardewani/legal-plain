import { describe, it, expect } from "vitest";
import { getRiskBadge } from "@/lib/riskBadge";

describe("getRiskBadge", () => {
  it("returns red classes for score >= 70", () => {
    const badge = getRiskBadge(70, "High Risk");
    expect(badge.colorClasses).toContain("#c0392b");
    expect(badge.label).toBe("High Risk");
  });

  it("returns amber classes for score 40-69", () => {
    const badge = getRiskBadge(55, "Moderate Risk");
    expect(badge.colorClasses).toContain("#b45309");
  });

  it("returns green classes for score < 40", () => {
    const badge = getRiskBadge(20, "Low Risk");
    expect(badge.colorClasses).toContain("#2d6a4f");
  });

  it("boundary: score 39 is green", () => {
    expect(getRiskBadge(39, "Standard").colorClasses).toContain("#2d6a4f");
  });

  it("boundary: score 40 is moderate", () => {
    expect(getRiskBadge(40, "Moderate Risk").colorClasses).toContain("#b45309");
  });
});
