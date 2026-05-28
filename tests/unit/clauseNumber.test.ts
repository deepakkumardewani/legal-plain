import { describe, it, expect } from "vitest";
import { clauseNumber, findClauseReferences } from "@/lib/utils";

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

describe("findClauseReferences", () => {
  it("finds bracket-wrapped references", () => {
    expect(findClauseReferences("See [clause-1] for details.")).toEqual([
      { id: "clause-1", index: 4, length: 10 },
    ]);
  });

  it("finds parenthesis-wrapped references", () => {
    expect(findClauseReferences("Agreement (clause-6) applies.")).toEqual([
      { id: "clause-6", index: 10, length: 10 },
    ]);
  });

  it("finds bare references", () => {
    expect(findClauseReferences("described in clause-5.")).toEqual([
      { id: "clause-5", index: 13, length: 8 },
    ]);
  });

  it("finds multiple references in one answer", () => {
    const refs = findClauseReferences("If you break (clause-6), see clause-5 for termination.");
    expect(refs).toEqual([
      { id: "clause-6", index: 13, length: 10 },
      { id: "clause-5", index: 29, length: 8 },
    ]);
  });
});
