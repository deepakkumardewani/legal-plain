"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getAnalysis, type AnalysisHistoryEntry } from "@/lib/analysisHistory";
import { useAnalysisStore } from "@/lib/useAnalysisStore";
import { HistoryItemMenu } from "@/components/history/HistoryItemMenu";

const DOC_TYPE_LABELS: Record<string, string> = {
  EMPLOYMENT_CONTRACT: "Employment Contract",
  NDA: "NDA",
  RESIDENTIAL_LEASE: "Residential Lease",
};

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getRiskPill(score: number, label: string) {
  if (score >= 70) return { label, bg: "bg-[#fdf2f0]", text: "text-[#b03020]" };
  if (score >= 40) return { label, bg: "bg-[#fef9ee]", text: "text-[#a05010]" };
  return { label, bg: "bg-[#edf7f2]", text: "text-[#256040]" };
}

interface HistoryItemCardProps {
  entry: AnalysisHistoryEntry;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function HistoryItemCard({ entry, onRename, onDelete }: HistoryItemCardProps) {
  const router = useRouter();
  const { setAnalysis } = useAnalysisStore();
  const [loading, setLoading] = useState(false);

  const pill = getRiskPill(entry.analysis.overallRiskScore, entry.analysis.overallRiskLabel);
  const docType = DOC_TYPE_LABELS[entry.analysis.documentType] ?? entry.analysis.documentType;
  const date = formatDate(entry.savedAt);
  const snippet = entry.documentText.slice(0, 180);

  async function handleReopen() {
    setLoading(true);
    try {
      const stored = await getAnalysis(entry.analysisId);
      if (!stored) return;
      setAnalysis(stored.analysis, stored.documentText);
      router.push("/results");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="group relative flex flex-col rounded-[1.25rem] border border-[#e8e0d4] bg-[#fffdf8] p-5 transition-all duration-200 hover:border-[#c8791a]/30 hover:shadow-[0_4px_20px_rgba(74,55,31,0.08)]">
      {/* Top row: doc type + risk pill */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#9a9080]">
              {docType}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${pill.bg} ${pill.text}`}
            >
              {pill.label}
            </span>
          </div>
          {entry.customName && (
            <p
              className="mt-1.5 truncate text-[15px] font-semibold leading-snug text-[#18181f]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {entry.customName}
            </p>
          )}
        </div>

        <div className="shrink-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100">
          <HistoryItemMenu
            entry={entry}
            label={entry.customName ?? `${docType} · ${date}`}
            onRename={onRename}
            onDelete={onDelete}
          />
        </div>
      </div>

      {/* Snippet */}
      {snippet && (
        <p className="mt-3 line-clamp-2 text-[12px] leading-relaxed text-[#8a8070]">{snippet}</p>
      )}

      {/* Date — bottom, lightest weight */}
      <p className="mt-3 text-[11px] text-[#b0a898]">{date}</p>

      {/* Clickable overlay — entire card reopens */}
      <button
        onClick={handleReopen}
        disabled={loading}
        aria-label={`Reopen: ${entry.customName ?? `${docType} · ${date}`}`}
        className="absolute inset-0 rounded-[1.25rem] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c8791a]/50"
      />

      {/* Loading spinner — sits above the overlay */}
      {loading && (
        <div className="absolute bottom-4 right-4 z-10 h-4 w-4 animate-spin rounded-full border-2 border-[#c8791a]/30 border-t-[#c8791a]" />
      )}
    </div>
  );
}
