import { describe, it, expect } from "vitest";
import { validatePdfFile } from "@/lib/pdfParser";

function makeFile(name: string, type: string, size: number): File {
  return new File([new ArrayBuffer(size)], name, { type });
}

describe("validatePdfFile", () => {
  it("accepts a valid PDF file", () => {
    const file = makeFile("test.pdf", "application/pdf", 1024);
    expect(validatePdfFile(file)).toBeNull();
  });

  it("rejects non-PDF MIME type", () => {
    const file = makeFile("test.png", "image/png", 1024);
    expect(validatePdfFile(file)).toBe("Only PDF files are supported. Please upload a .pdf file.");
  });

  it("rejects files larger than 10 MB", () => {
    const file = makeFile("big.pdf", "application/pdf", 11 * 1024 * 1024);
    expect(validatePdfFile(file)).toBe("PDF file exceeds the 10 MB size limit.");
  });

  it("rejects empty files", () => {
    const file = makeFile("empty.pdf", "application/pdf", 0);
    expect(validatePdfFile(file)).toBe("The uploaded PDF file is empty.");
  });

  it("accepts file at exactly 10 MB", () => {
    const file = makeFile("max.pdf", "application/pdf", 10 * 1024 * 1024);
    expect(validatePdfFile(file)).toBeNull();
  });
});
