"use client";

export function AnalyzingGuardBanner() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 rounded-xl border border-[#ecd9b8] bg-[#fef9ee] px-4 py-3 text-sm text-[#8a5a12]"
    >
      <span
        className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[#b45309] border-t-transparent"
        aria-hidden="true"
      />
      <span className="font-medium">
        Analyzing… please don&apos;t close, refresh, or leave this page
      </span>
    </div>
  );
}
