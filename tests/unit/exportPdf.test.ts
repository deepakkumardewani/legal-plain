import { describe, it, expect, vi, beforeEach } from "vitest";
import { sampleAnalysis } from "@/tests/fixtures/analysis";
import type { AnalysisResult } from "@/lib/types";

// jsPDF uses browser globals — we mock it for unit testing
const mockOutput = vi.fn(
  () => new Blob(["mock-pdf-content-LexLight"], { type: "application/pdf" }),
);
const mockDoc = {
  setFontSize: vi.fn(),
  setFont: vi.fn(),
  setTextColor: vi.fn(),
  setDrawColor: vi.fn(),
  text: vi.fn(),
  line: vi.fn(),
  addPage: vi.fn(),
  setPage: vi.fn(),
  splitTextToSize: vi.fn((text: string, maxWidth: number) => {
    // Simulate realistic wrapping: chunk at maxWidth characters
    const chunkSize = Math.max(1, Math.floor(maxWidth));
    const result: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      result.push(text.slice(i, i + chunkSize));
    }
    return result.length > 0 ? result : [text];
  }),
  getTextWidth: vi.fn(() => 10),
  internal: { pageSize: { getHeight: vi.fn(() => 297) }, getNumberOfPages: vi.fn(() => 1) },
  output: mockOutput,
};

vi.mock("jspdf", () => ({
  jsPDF: vi.fn(() => mockDoc),
}));

describe("toPdf", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDoc.internal.getNumberOfPages = vi.fn(() => 1);
    mockDoc.splitTextToSize.mockImplementation((text: string, maxWidth: number) => {
      const chunkSize = Math.max(1, Math.floor(maxWidth));
      const result: string[] = [];
      for (let i = 0; i < text.length; i += chunkSize) {
        result.push(text.slice(i, i + chunkSize));
      }
      return result.length > 0 ? result : [text];
    });
  });

  it("returns a Blob", async () => {
    const { toPdf } = await import("@/lib/exportPdf");
    const blob = await toPdf(sampleAnalysis);
    expect(blob).toBeInstanceOf(Blob);
  });

  it("produces a non-empty blob", async () => {
    const { toPdf } = await import("@/lib/exportPdf");
    const blob = await toPdf(sampleAnalysis);
    expect(blob.size).toBeGreaterThan(0);
  });

  it("calls doc.output with 'blob'", async () => {
    const { toPdf } = await import("@/lib/exportPdf");
    await toPdf(sampleAnalysis);
    expect(mockOutput).toHaveBeenCalledWith("blob");
  });

  it("includes LexLight in the text calls", async () => {
    const { toPdf } = await import("@/lib/exportPdf");
    await toPdf(sampleAnalysis);
    const allTextCalls = mockDoc.text.mock.calls.flat(2).join(" ");
    expect(allTextCalls).toContain("LexLight");
  });

  it("renders mismatch section when present", async () => {
    const { toPdf } = await import("@/lib/exportPdf");
    await toPdf(sampleAnalysis);
    const allTextCalls = mockDoc.text.mock.calls.flat(2).join(" ");
    expect(allTextCalls).toContain("Jurisdiction Mismatch");
  });

  it("skips mismatch section when null", async () => {
    const { toPdf } = await import("@/lib/exportPdf");
    const analysis = { ...sampleAnalysis, jurisdictionMismatch: null };
    await toPdf(analysis);
    const allTextCalls = mockDoc.text.mock.calls.flat(2).join(" ");
    expect(allTextCalls).not.toContain("Jurisdiction Mismatch");
  });

  it("adds footer with 'not legal advice'", async () => {
    const { toPdf } = await import("@/lib/exportPdf");
    await toPdf(sampleAnalysis);
    const allTextCalls = mockDoc.text.mock.calls.flat(2).join(" ");
    expect(allTextCalls).toContain("not legal advice");
  });

  it("renders all four risk levels present in sample", async () => {
    const { toPdf } = await import("@/lib/exportPdf");
    await toPdf(sampleAnalysis);
    const allTextCalls = mockDoc.text.mock.calls.flat(2).join(" ");
    expect(allTextCalls).toContain("RED FLAG");
    expect(allTextCalls).toContain("STANDARD");
  });

  it("strips control characters from text before rendering", async () => {
    const { toPdf } = await import("@/lib/exportPdf");
    const analysis: AnalysisResult = {
      ...sampleAnalysis,
      clauses: [
        {
          ...sampleAnalysis.clauses[0],
          plainEnglish: "normal text\x01\x07 with control chars",
        },
      ],
    };
    await toPdf(analysis);
    const allSplitCalls = mockDoc.splitTextToSize.mock.calls.flat(2).join("");
    //  and  control bytes must be stripped before splitTextToSize is called
    expect(allSplitCalls).not.toContain("");
    expect(allSplitCalls).not.toContain("");
    expect(allSplitCalls).toContain("normal text");
  });

  it("throws if jsPDF internal API is missing getNumberOfPages", async () => {
    const { toPdf } = await import("@/lib/exportPdf");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockDoc.internal as any).getNumberOfPages = undefined;
    await expect(toPdf(sampleAnalysis)).rejects.toThrow("jsPDF internal API changed");
  });
});

describe("downloadPdf", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDoc.internal.getNumberOfPages = vi.fn(() => 1);
    mockDoc.splitTextToSize.mockImplementation((text: string) => [text]);

    const mockUrl = "blob:mock-pdf-url";
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => mockUrl),
      revokeObjectURL: vi.fn(),
    });
    const mockLink = { href: "", download: "", click: vi.fn() };
    vi.spyOn(document, "createElement").mockReturnValue(mockLink as unknown as HTMLElement);
  });

  it("creates a download link with correct filename", async () => {
    const mockLink = { href: "", download: "", click: vi.fn() };
    vi.spyOn(document, "createElement").mockReturnValue(mockLink as unknown as HTMLElement);
    const { downloadPdf } = await import("@/lib/exportPdf");
    await downloadPdf(sampleAnalysis);
    expect(mockLink.download).toMatch(/lexlight-analysis-.+\.pdf$/);
  });

  it("revokes the object URL after download", async () => {
    const { downloadPdf } = await import("@/lib/exportPdf");
    await downloadPdf(sampleAnalysis);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-pdf-url");
  });
});
