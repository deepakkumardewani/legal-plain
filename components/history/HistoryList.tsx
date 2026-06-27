"use client";

import Link from "next/link";
import { useAnalysisHistory } from "@/lib/useAnalysisHistory";
import { HistoryItemCard } from "@/components/history/HistoryItemCard";
import { ClearHistoryButton } from "@/components/history/ClearHistoryButton";

export function HistoryList() {
  const { entries, rename, remove, clearAll } = useAnalysisHistory();

  if (entries.length === 0) {
    return (
      <div className="border-t border-[#e6dccd] pt-10 pb-4">
        <p
          className="text-[11px] font-semibold uppercase tracking-widest text-[#c8791a]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Nothing here yet
        </p>
        <p
          className="mt-3 text-xl font-semibold tracking-tight text-[#18181f]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Your analyses will appear here
        </p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#6b6558]">
          Past results are saved in this browser — no account, no server. Come back anytime to
          reopen, rename, or share a result.
        </p>
        <Link
          href="/analyze"
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-[#c8791a] px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#b56a15]"
        >
          Analyze a document
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
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-[#9a9080]">
          {entries.length} {entries.length === 1 ? "analysis" : "analyses"}
        </p>
        <ClearHistoryButton onClear={clearAll} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
