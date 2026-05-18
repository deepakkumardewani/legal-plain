"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { validatePdfFile, extractPdfText } from "@/lib/pdfParser";

interface PdfUploadProps {
  onText: (text: string) => void;
}

export function PdfUpload({ onText }: PdfUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleError = useCallback((message: string) => {
    setError(message);
    setLoading(false);
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setLoading(true);

      const validationError = validatePdfFile(file);
      if (validationError) {
        handleError(validationError);
        return;
      }

      try {
        const result = await extractPdfText(file);
        setLoading(false);
        onText(result.text);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to extract text from PDF.";
        handleError(message);
      }
    },
    [onText, handleError],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
      // Reset the input so the same file can be selected again
      e.target.value = "";
    },
    [processFile],
  );

  return (
    <div className="w-full">
      <div
        className={cn(
          "flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-b-md border border-t-0 border-dashed p-8 transition-colors",
          dragOver && "border-gray-900 bg-gray-50",
          !dragOver && "border-gray-300 hover:border-gray-400",
          loading && "pointer-events-none opacity-60",
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
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
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
          <p className="text-sm text-gray-500">Extracting text from PDF…</p>
        ) : (
          <>
            <svg
              className="mb-3 h-8 w-8 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">Click to upload</span> or drag and drop
            </p>
            <p className="mt-1 text-xs text-gray-400">PDF only, up to 10 MB</p>
          </>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
