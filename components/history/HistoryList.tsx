"use client";

import Link from "next/link";
import { useAnalysisHistory } from "@/lib/useAnalysisHistory";
import { HistoryItemCard } from "@/components/history/HistoryItemCard";
import { ClearHistoryButton } from "@/components/history/ClearHistoryButton";

export function HistoryList() {
  const { entries, rename, remove, clearAll } = useAnalysisHistory();

  if (entries.length === 0) {
    return (
      <div className="py-8">
        <p
          className="text-base font-semibold text-[#18181f]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          No analyses yet
        </p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#6b6558]">
          Every document you analyse will be saved here automatically so you can come back to it
          later — no account needed.
        </p>
        <Link
          href="/analyze"
          className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-[#c8791a] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#b56a15]"
        >
          Analyse a document
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
          </svg>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <ClearHistoryButton onClear={clearAll} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {entries.map((entry) => (
          <HistoryItemCard
            key={entry.analysisId}
            entry={entry}
            onRename={rename}
            onDelete={remove}
          />
        ))}
      </div>
    </div>
  );
}
