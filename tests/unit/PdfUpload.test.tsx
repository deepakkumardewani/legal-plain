import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { PdfUpload } from "@/components/input/PdfUpload";

const mockExtractPdfText = vi.fn();
const mockValidatePdfFile = vi.fn();

vi.mock("@/lib/pdfParser", () => ({
  extractPdfText: (file: File) => mockExtractPdfText(file),
  validatePdfFile: (file: File) => mockValidatePdfFile(file),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function makeFile(name: string, type: string, size: number): File {
  return new File([new ArrayBuffer(size)], name, { type });
}

describe("PdfUpload", () => {
  it("renders the drop zone", () => {
    render(<PdfUpload onText={() => {}} />);

    expect(screen.getByText("Drop your document here")).toBeInTheDocument();
    expect(screen.getByText("PDF · up to 20 pages · 10 MB")).toBeInTheDocument();
  });

  it("shows loading state during extraction", async () => {
    // Make extraction hang
    mockValidatePdfFile.mockReturnValue(null);
    mockExtractPdfText.mockReturnValue(new Promise(() => {}));

    render(<PdfUpload onText={() => {}} />);

    const file = makeFile("test.pdf", "application/pdf", 1024);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText("Reading your document…")).toBeInTheDocument();
    });
  });

  it("shows validation error for wrong MIME type", async () => {
    mockValidatePdfFile.mockReturnValue("Only PDF files are supported.");

    render(<PdfUpload onText={() => {}} />);

    const file = makeFile("test.png", "image/png", 1024);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Only PDF files are supported.");
    });
  });

  it("shows validation error for oversized file", async () => {
    mockValidatePdfFile.mockReturnValue("PDF file exceeds the 10 MB size limit.");

    render(<PdfUpload onText={() => {}} />);

    const file = makeFile("big.pdf", "application/pdf", 11 * 1024 * 1024);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("PDF file exceeds the 10 MB size limit.");
    });
  });

  it("calls onText with extracted text on success", async () => {
    mockValidatePdfFile.mockReturnValue(null);
    mockExtractPdfText.mockResolvedValue({ text: "Extracted PDF content" });
    const onText = vi.fn();

    render(<PdfUpload onText={onText} />);

    const file = makeFile("test.pdf", "application/pdf", 1024);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(onText).toHaveBeenCalledWith("Extracted PDF content");
    });
  });

  it("handles drag over state", () => {
    render(<PdfUpload onText={() => {}} />);

    const dropZone = screen.getByRole("button", { name: "Upload PDF file" });

    fireEvent.dragOver(dropZone);
    expect(dropZone.className).toContain("bg-[#f4eddf]");

    fireEvent.dragLeave(dropZone);
    expect(dropZone.className).not.toContain("bg-[#f4eddf]");
  });

  it("processes file on drop", async () => {
    mockValidatePdfFile.mockReturnValue(null);
    mockExtractPdfText.mockResolvedValue({ text: "Dropped PDF" });
    const onText = vi.fn();

    render(<PdfUpload onText={onText} />);

    const dropZone = screen.getByRole("button", { name: "Upload PDF file" });

    const file = makeFile("drop.pdf", "application/pdf", 1024);
    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => {
      expect(onText).toHaveBeenCalledWith("Dropped PDF");
    });
  });

  it("is keyboard accessible", () => {
    render(<PdfUpload onText={() => {}} />);

    const dropZone = screen.getByRole("button", { name: "Upload PDF file" });

    const clickSpy = vi.spyOn(HTMLInputElement.prototype, "click");

    fireEvent.keyDown(dropZone, { key: "Enter" });
    expect(clickSpy).toHaveBeenCalled();

    fireEvent.keyDown(dropZone, { key: " " });
    expect(clickSpy).toHaveBeenCalled();

    clickSpy.mockRestore();
  });
});
