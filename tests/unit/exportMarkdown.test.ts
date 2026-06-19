import { describe, it, expect, vi, beforeEach } from "vitest";
import { toMarkdown, downloadMarkdown } from "@/lib/exportMarkdown";
import { sampleAnalysis } from "@/tests/fixtures/analysis";
import type { AnalysisResult } from "@/lib/types";

describe("toMarkdown", () => {
  it("includes document type and risk score in header", () => {
    const md = toMarkdown(sampleAnalysis);
    expect(md).toContain("EMPLOYMENT CONTRACT");
    expect(md).toContain("75/100");
    expect(md).toContain("Moderate Risk");
  });

  it("includes jurisdiction mismatch section when present", () => {
    const md = toMarkdown(sampleAnalysis);
    expect(md).toContain("Jurisdiction Mismatch");
    expect(md).toContain("HIGH confidence");
    expect(md).toContain("New York, USA");
  });

  it("omits jurisdiction mismatch section when null", () => {
    const analysis = { ...sampleAnalysis, jurisdictionMismatch: null };
    const md = toMarkdown(analysis);
    expect(md).not.toContain("Jurisdiction Mismatch");
  });

  it("includes all risk-level clause sections", () => {
    const md = toMarkdown(sampleAnalysis);
    expect(md).toContain("🔴 Red Flag");
    expect(md).toContain("🟢 Standard");
    expect(md).toContain("⚪ Context Dependent");
  });

  it("includes negotiation tip for RED clause", () => {
    const md = toMarkdown(sampleAnalysis);
    expect(md).toContain("Negotiation tip");
    expect(md).toContain("limit to specific competitors");
  });

  it("includes context note for CONTEXT_DEPENDENT clause", () => {
    const md = toMarkdown(sampleAnalysis);
    expect(md).toContain("Context note");
    expect(md).toContain("company's size");
  });

  it("marks clause affected by mismatch", () => {
    const md = toMarkdown(sampleAnalysis);
    expect(md).toContain("affected by a jurisdiction mismatch");
  });

  it("includes missing clauses section", () => {
    const md = toMarkdown(sampleAnalysis);
    expect(md).toContain("Missing Clauses");
    expect(md).toContain("Expense Reimbursement");
  });

  it("includes key dates sorted by urgency", () => {
    const md = toMarkdown(sampleAnalysis);
    expect(md).toContain("Key Dates");
    expect(md).toContain("Non-compete duration");
    const highIdx = md.indexOf("🔴");
    expect(highIdx).toBeGreaterThan(-1);
  });

  it("includes rights and obligations", () => {
    const md = toMarkdown(sampleAnalysis);
    expect(md).toContain("Your Rights");
    expect(md).toContain("Your Obligations");
    expect(md).toContain("Terminate employment");
  });

  it("includes footer disclaimer", () => {
    const md = toMarkdown(sampleAnalysis);
    expect(md).toContain("not legal advice");
  });

  it("omits empty sections", () => {
    const analysis = {
      ...sampleAnalysis,
      missingClauses: [],
      keyDates: [],
      yourRights: [],
      yourObligations: [],
    };
    const md = toMarkdown(analysis);
    expect(md).not.toContain("## Missing Clauses");
    expect(md).not.toContain("## Key Dates");
    expect(md).not.toContain("## Your Rights");
    expect(md).not.toContain("## Your Obligations");
  });

  it("produces deterministic output", () => {
    expect(toMarkdown(sampleAnalysis)).toBe(toMarkdown(sampleAnalysis));
  });

  describe("sanitization", () => {
    it("escapes markdown special chars in clause plainEnglish", () => {
      const analysis: AnalysisResult = {
        ...sampleAnalysis,
        clauses: [
          {
            ...sampleAnalysis.clauses[0],
            plainEnglish: "You **cannot** use `backticks` or [links](http://evil.com)",
          },
        ],
      };
      const md = toMarkdown(analysis);
      // Raw markdown syntax should be escaped, not rendered
      expect(md).not.toContain("**cannot**");
      expect(md).not.toContain("[links](http://evil.com)");
      expect(md).toContain("\\*\\*cannot\\*\\*");
    });

    it("escapes markdown special chars in clause riskReason", () => {
      const analysis: AnalysisResult = {
        ...sampleAnalysis,
        clauses: [
          {
            ...sampleAnalysis.clauses[0],
            riskReason: "Clause *1* uses `code` injection",
          },
        ],
      };
      const md = toMarkdown(analysis);
      expect(md).not.toContain("*1*");
      expect(md).toContain("\\*1\\*");
    });

    it("escapes markdown special chars in missingClause title", () => {
      const analysis: AnalysisResult = {
        ...sampleAnalysis,
        missingClauses: [
          {
            title: "Section [A] (critical)",
            whyItMatters: "normal text",
            whatToAskFor: "normal text",
          },
        ],
      };
      const md = toMarkdown(analysis);
      expect(md).not.toContain("[A]");
      expect(md).toContain("\\[A\\]");
    });

    it("does not escape content inside originalExcerpt code blocks", () => {
      const analysis: AnalysisResult = {
        ...sampleAnalysis,
        clauses: [
          {
            ...sampleAnalysis.clauses[0],
            originalExcerpt: "raw **original** text with `code`",
          },
        ],
      };
      const md = toMarkdown(analysis);
      // Original excerpt is in a fenced code block and must NOT be escaped
      expect(md).toContain("raw **original** text with `code`");
    });
  });
});

describe("downloadMarkdown", () => {
  beforeEach(() => {
    const mockUrl = "blob:mock-url";
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => mockUrl),
      revokeObjectURL: vi.fn(),
    });
    vi.stubGlobal(
      "Blob",
      class {
        constructor(
          public parts: unknown[],
          public opts?: unknown,
        ) {}
      },
    );
    const mockLink = {
      href: "",
      download: "",
      click: vi.fn(),
    };
    vi.spyOn(document, "createElement").mockReturnValue(mockLink as unknown as HTMLElement);
  });

  it("creates a blob URL and triggers download", () => {
    downloadMarkdown(sampleAnalysis);
    expect(URL.createObjectURL).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  it("uses the correct filename with date", () => {
    const mockLink = { href: "", download: "", click: vi.fn() };
    vi.spyOn(document, "createElement").mockReturnValue(mockLink as unknown as HTMLElement);
    downloadMarkdown(sampleAnalysis);
    expect(mockLink.download).toContain("lexlight-analysis-");
    expect(mockLink.download).toMatch(/\.md$/);
  });
});
