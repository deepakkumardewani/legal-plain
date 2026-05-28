"use client";

import { cn } from "@/lib/utils";

interface AnalyzeButtonProps {
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
}

export function AnalyzeButton({ disabled, loading, onClick }: AnalyzeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-label="Analyze document"
      style={{ fontFamily: "var(--font-display)" }}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-4 text-base font-semibold text-white transition-all",
        "bg-[#c8791a] hover:bg-[#b36815] hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8791a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf9f6]",
        "disabled:cursor-not-allowed disabled:bg-[#dccab0] disabled:text-white/80 disabled:translate-y-0 disabled:hover:translate-y-0",
        loading && "cursor-wait",
      )}
    >
      {loading ? (
        <>
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            aria-hidden
          />
          Analyzing…
        </>
      ) : (
        <>
          Analyze my document
          <span aria-hidden>→</span>
        </>
      )}
    </button>
  );
}
