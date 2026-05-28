"use client";

import type { JurisdictionMismatch } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useClauseNav } from "./ClauseNavigationContext";

interface JurisdictionMismatchBannerProps {
  mismatch: JurisdictionMismatch;
}

export function JurisdictionMismatchBanner({ mismatch }: JurisdictionMismatchBannerProps) {
  const { goToClause } = useClauseNav();
  const isHigh = mismatch.confidence === "HIGH";

  const scrollToFirstAffected = () => {
    if (mismatch.affectedClauseIds.length === 0) return;
    goToClause(mismatch.affectedClauseIds[0]!);
  };

  return (
    <div
      className={cn(
        "mt-6 rounded-xl border p-4 md:p-5",
        isHigh ? "border-[#ecd9b8] bg-[#fef9ee]" : "border-dashed border-[#e6dccd] bg-[#fffdf8]",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-lg text-[#b45309]" aria-hidden="true">
          {isHigh ? "!" : "i"}
        </span>
        <div className="min-w-0 flex-1">
          <h2
            className="text-sm font-semibold text-[#8a5a12]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {isHigh ? "Jurisdiction Mismatch Detected" : "Possible Jurisdiction Mismatch"}
          </h2>

          <p className="mt-1 text-sm text-[#6b4a12]">{mismatch.plainEnglish}</p>

          <p className="mt-2 text-sm text-[#8a5a12]">{mismatch.whyItMatters}</p>

          {isHigh && mismatch.affectedClauseIds.length > 0 && (
            <button
              type="button"
              className="mt-2 text-sm font-medium text-[#c8791a] underline transition-colors hover:text-[#ad6414] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8791a]/40"
              onClick={scrollToFirstAffected}
            >
              {mismatch.affectedClauseIds.length}{" "}
              {mismatch.affectedClauseIds.length === 1 ? "clause" : "clauses"} affected
              {" —"} go to first
            </button>
          )}

          {!isHigh && (
            <p className="mt-2 text-sm text-[#8a5a12]">
              Verify your contract&apos;s governing law clause to confirm whether a mismatch exists.
            </p>
          )}

          {isHigh && mismatch.whatToAskFor && (
            <div className="mt-3 rounded-lg bg-[#f7efe2] px-3 py-2 text-sm text-[#6b4a12]">
              <span className="font-medium">What to ask for: </span>
              {mismatch.whatToAskFor}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
