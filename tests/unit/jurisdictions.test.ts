import { describe, it, expect } from "vitest";
import { US_STATES, COMMON_COUNTRIES, ALL_JURISDICTIONS } from "@/lib/jurisdictions";

describe("US_STATES", () => {
  it("includes 50 states plus DC", () => {
    expect(US_STATES.length).toBe(51);
  });

  it("each entry has value and label", () => {
    for (const entry of US_STATES) {
      expect(entry.value).toBeTruthy();
      expect(entry.label).toBeTruthy();
    }
  });

  it("includes California", () => {
    const ca = US_STATES.find((s) => s.value === "US-CA");
    expect(ca).toBeDefined();
    expect(ca!.label).toBe("California, USA");
  });

  it("all values start with US-", () => {
    for (const entry of US_STATES) {
      expect(entry.value.startsWith("US-")).toBe(true);
    }
  });
});

describe("COMMON_COUNTRIES", () => {
  it("includes common countries", () => {
    expect(COMMON_COUNTRIES.length).toBeGreaterThan(0);
  });

  it("includes India and United Kingdom", () => {
    const values = COMMON_COUNTRIES.map((c) => c.value);
    expect(values).toContain("GB");
    expect(values).toContain("IN");
  });

  it("each entry has value and label", () => {
    for (const entry of COMMON_COUNTRIES) {
      expect(entry.value).toBeTruthy();
      expect(entry.label).toBeTruthy();
    }
  });
});

describe("ALL_JURISDICTIONS", () => {
  it("starts with 'Not specified' empty value", () => {
    expect(ALL_JURISDICTIONS[0]!.value).toBe("");
    expect(ALL_JURISDICTIONS[0]!.label).toBe("Not specified");
  });

  it("contains all states and common countries", () => {
    // +1 for "Not specified"
    expect(ALL_JURISDICTIONS.length).toBe(US_STATES.length + COMMON_COUNTRIES.length + 1);
  });
});
