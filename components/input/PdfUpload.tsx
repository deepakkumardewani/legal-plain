"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { validatePdfFile, extractPdfText } from "@/lib/pdfParser";

const MAX_CHARS = 150_000;

interface PdfUploadProps {
  onText: (text: string) => void;
}

interface LoadedDoc {
  fileName: string;
  charCount: number;
  pageCount: number;
  truncated: boolean;
}

export function PdfUpload({ onText }: PdfUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<LoadedDoc | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleError = useCallback((message: string) => {
    setError(message);
    setLoading(false);
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setLoaded(null);
      setLoading(true);

      const validationError = validatePdfFile(file);
      if (validationError) {
        handleError(validationError);
        return;
      }

      try {
        const result = await extractPdfText(file);
        const truncated = result.text.length > MAX_CHARS;
        const text = truncated ? result.text.slice(0, MAX_CHARS) : result.text;
        setLoaded({
          fileName: file.name,
          charCount: text.length,
          pageCount: result.pageCount,
          truncated,
        });
        setLoading(false);
        onText(text);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to extract text from PDF.";
        handleError(message);
      }
    },
    [onText, handleError],
  );

  const clearFile = useCallback(() => {
    setLoaded(null);
    setError(null);
    onText("");
    fileInputRef.current?.focus();
  }, [onText]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile],
  );

  const openPicker = useCallback(() => fileInputRef.current?.click(), []);

  if (loaded) {
    return (
      <div className="w-full">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
          aria-hidden="true"
        />
        <div className="rounded-[1.4rem] border border-[#e4dfd6] bg-[#fffdf8] p-5 shadow-[0_20px_60px_-50px_rgba(74,55,31,0.6)]">
          <div className="flex items-center gap-4">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1f7a4d]/10 text-[#1f7a4d]"
              aria-hidden
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p
                className="truncate text-[15px] font-semibold text-[#18181f]"
                title={loaded.fileName}
              >
                {loaded.fileName}
              </p>
              <p className="mt-0.5 text-sm text-[#72728a] tabular-nums">
                {loaded.pageCount} page{loaded.pageCount === 1 ? "" : "s"} ·{" "}
                {loaded.charCount.toLocaleString("en-US")} characters · ready to analyze
              </p>
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium text-[#72728a] transition-colors hover:bg-[#f5f0e8] hover:text-[#18181f]"
            >
              Remove
            </button>
          </div>
          {loaded.truncated && (
            <p className="mt-4 rounded-xl bg-[#fbf3e3] px-4 py-2.5 text-sm text-[#9a6310]">
              This contract is long — we trimmed it to the first {MAX_CHARS.toLocaleString("en-US")}{" "}
              characters for analysis.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        className={cn(
          "group relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border border-dashed p-10 text-center transition-all duration-300",
          dragOver
            ? "border-[#c8791a] bg-[#f4eddf]"
            : "border-[#d8d2c6] bg-[#fffdf8] hover:-translate-y-0.5 hover:border-[#c8791a]/50 hover:bg-[#fbf8f1] hover:shadow-[0_26px_70px_-56px_rgba(74,55,31,0.7)]",
          loading && "pointer-events-none opacity-70",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDrop={handleDrop}
        onClick={openPicker}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        aria-label="Upload PDF file"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
          aria-hidden="true"
        />

        {loading ? (
          <div className="flex flex-col items-center">
            <span
              className="mb-4 h-9 w-9 animate-spin rounded-full border-[3px] border-[#e4dfd6] border-t-[#c8791a]"
              aria-hidden
            />
            <p className="text-[15px] font-medium text-[#18181f]">Reading your document…</p>
            <p className="mt-1 text-sm text-[#72728a]">Extracting text from the PDF</p>
          </div>
        ) : (
          <>
            <span
              className={cn(
                "mb-5 flex h-14 w-14 items-center justify-center rounded-2xl transition-colors",
                dragOver
                  ? "bg-[#c8791a] text-white"
                  : "bg-[#f5f0e8] text-[#c8791a] group-hover:bg-[#c8791a] group-hover:text-white",
              )}
              aria-hidden
            >
              <svg
                className="h-7 w-7"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16.5V6m0 0L8.25 9.75M12 6l3.75 3.75M4.5 16.5v1.875A2.625 2.625 0 0 0 7.125 21h9.75a2.625 2.625 0 0 0 2.625-2.625V16.5"
                />
              </svg>
            </span>
            <p
              className="text-xl font-bold text-[#18181f]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {dragOver ? "Drop to upload" : "Drop your document here"}
            </p>
            <p className="mt-2 text-[15px] text-[#72728a]">
              or{" "}
              <span className="font-semibold text-[#c8791a] underline decoration-[#c8791a]/30 underline-offset-2">
                browse your files
              </span>
            </p>
            <p className="mt-5 text-xs font-medium uppercase tracking-wider text-[#a3a0a8]">
              PDF · up to 20 pages · 10 MB
            </p>
          </>
        )}
      </div>

      {error && (
        <p
          className="mt-3 rounded-xl bg-[#fbeceb] px-4 py-3 text-sm font-medium text-[#b3261e]"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
