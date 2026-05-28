const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_PAGES = 20;
const MIN_TEXT_LENGTH = 100;

export interface PdfParseResult {
  text: string;
  pageCount: number;
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

  // pdfjs needs an explicit worker URL in bundled environments; resolved as a
  // static asset by the bundler so the version always matches pdfjs-dist.
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const doc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const pageCount = doc.numPages;

  if (pageCount > MAX_PAGES) {
    doc.destroy();
    throw new Error(`PDF exceeds the ${MAX_PAGES}-page limit.`);
  }

  const pages: string[] = [];
  for (let i = 1; i <= pageCount; i++) {
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
      "This PDF appears to be scanned. Please upload a searchable PDF or run OCR first.",
    ) as Error & { isScanned: boolean };
    error.isScanned = true;
    throw error;
  }

  return { text, pageCount };
}
