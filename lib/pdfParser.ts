const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MIN_TEXT_LENGTH = 100;

export interface PdfParseResult {
  text: string;
}

export interface PdfParseError {
  error: string;
  isScanned?: boolean;
}

export function validatePdfFile(file: File): string | null {
  if (file.type !== "application/pdf") {
    return "Only PDF files are supported. Please upload a .pdf file.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "PDF file exceeds the 10 MB size limit.";
  }
  if (file.size === 0) {
    return "The uploaded PDF file is empty.";
  }
  return null;
}

export async function extractPdfText(file: File): Promise<PdfParseResult> {
  const validationError = validatePdfFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdfjs = await import("pdfjs-dist");

  const doc = await pdfjs.getDocument({ data: arrayBuffer, useWorkerFetch: false }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => {
        if ("str" in item) return item.str;
        return "";
      })
      .filter(Boolean)
      .join(" ");
    pages.push(text);
  }

  doc.destroy();

  const text = pages.join("\n\n").trim();

  if (text.length < MIN_TEXT_LENGTH) {
    const error = new Error(
      "This PDF appears to be scanned. Please paste the text or run OCR first.",
    ) as Error & { isScanned: boolean };
    error.isScanned = true;
    throw error;
  }

  return { text };
}
