"use client";

import Link from "next/link";
import Image from "next/image";
import { useAnalysisStore } from "@/lib/useAnalysisStore";
import { ExportMenu } from "@/components/export/ExportMenu";

export function ResultsHeader() {
  const { analysis } = useAnalysisStore();

  return (
    <header className="sticky top-0 z-40 border-b border-[#e6dccd] bg-[#fbf8f1]/95 px-4 py-3 backdrop-blur-xl md:px-6">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-[#6b6558] transition-colors duration-150 hover:bg-[#f0ebe4] hover:text-[#18181f]"
            aria-label="Back to home"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Back
          </Link>

          <div className="h-4 w-px bg-[#ddd5c8]" aria-hidden />

          <Link href="/" className="group flex items-center gap-2" aria-label="LexLight home">
            <Image
              src="/logo.svg"
              alt="LexLight Logo"
              width={26}
              height={26}
              className="rounded-full transition-transform duration-200 group-hover:-rotate-6"
            />
            <span
              className="text-[15px] font-semibold tracking-tight text-[#18181f]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              LexLight
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href="/history"
            className="rounded-md border border-[#e0d8cc] bg-[#fffdf8] px-3 py-1.5 text-sm font-medium text-[#6b6558] transition-all duration-150 hover:border-[#c8791a]/40 hover:bg-[#fff8f0] hover:text-[#18181f]"
          >
            History
          </Link>

          <Link
            href="/analyze"
            className="rounded-md border border-[#e0d8cc] bg-[#fffdf8] px-3 py-1.5 text-sm font-medium text-[#6b6558] transition-all duration-150 hover:border-[#c8791a]/40 hover:bg-[#fff8f0] hover:text-[#18181f]"
          >
            New analysis
          </Link>

          {analysis && <ExportMenu analysis={analysis} />}
        </div>
      </div>
    </header>
  );
}
