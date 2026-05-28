import { describe, it, expect } from "vitest";
import { clauseNumber } from "@/lib/utils";

describe("clauseNumber", () => {
  it('extracts numeric suffix from "clause-16"', () => {
    expect(clauseNumber("clause-16")).toBe(16);
  });

  it("falls back to index + 1 when id has no numeric suffix", () => {
    expect(clauseNumber("c1", 2)).toBe(3);
  });

  it("defaults fallback index to 0", () => {
    expect(clauseNumber("no-number")).toBe(1);
  });
});
