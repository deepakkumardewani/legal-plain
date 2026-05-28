import { describe, it, expect } from "vitest";
import { buildAnalysisCacheKey, ANALYSIS_CACHE_VERSION } from "@/lib/analysisCache";

describe("analysisCache", () => {
  it("uses stable keys for the same document and type", () => {
    const text = "Employment agreement section 1.";
    const a = buildAnalysisCacheKey({
      documentText: text,
      documentType: "EMPLOYMENT_CONTRACT",
    });
    const b = buildAnalysisCacheKey({
      documentText: `  ${text}  `,
      documentType: "EMPLOYMENT_CONTRACT",
    });
    expect(a).toBe(b);
    expect(a.startsWith(`analysis:v${ANALYSIS_CACHE_VERSION}:`)).toBe(true);
  });

  it("differs when document type or NDA role changes", () => {
    const text = "Same body text";
    const employment = buildAnalysisCacheKey({
      documentText: text,
      documentType: "EMPLOYMENT_CONTRACT",
    });
    const nda = buildAnalysisCacheKey({
      documentText: text,
      documentType: "NDA",
      userRole: "RECEIVING",
    });
    expect(employment).not.toBe(nda);
  });
});
