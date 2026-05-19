import type { JurisdictionMismatch } from "@/lib/types";
import { cn } from "@/lib/utils";

interface JurisdictionMismatchBannerProps {
  mismatch: JurisdictionMismatch;
}

export function JurisdictionMismatchBanner({ mismatch }: JurisdictionMismatchBannerProps) {
  const isHigh = mismatch.confidence === "HIGH";

  const scrollToFirstAffected = () => {
    if (mismatch.affectedClauseIds.length === 0) return;
    const firstId = mismatch.affectedClauseIds[0]!;
    const el = document.getElementById(`clause-${firstId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div
      className={cn(
        "mt-6 rounded-lg border p-4",
        isHigh
          ? "border-amber-400 bg-amber-50"
          : "border-amber-300 bg-amber-50/50 border-dashed",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-lg" aria-hidden="true">
          {isHigh ? "⚠" : "ℹ"}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-amber-900">
            {isHigh
              ? "Jurisdiction Mismatch Detected"
              : "Possible Jurisdiction Mismatch"}
          </h2>

          <p className="mt-1 text-sm text-amber-800">{mismatch.plainEnglish}</p>

          <p className="mt-2 text-sm text-amber-700">{mismatch.whyItMatters}</p>

          {isHigh && mismatch.affectedClauseIds.length > 0 && (
            <button
              type="button"
              className="mt-2 text-sm font-medium text-amber-900 underline hover:text-amber-700"
              onClick={scrollToFirstAffected}
            >
              {mismatch.affectedClauseIds.length}{" "}
              {mismatch.affectedClauseIds.length === 1 ? "clause" : "clauses"} affected
              {" —"} scroll to first
            </button>
          )}

          {!isHigh && (
            <p className="mt-2 text-sm text-amber-700">
              Verify your contract&apos;s governing law clause to confirm whether a mismatch
              exists.
            </p>
          )}

          {isHigh && mismatch.whatToAskFor && (
            <div className="mt-3 rounded-md bg-amber-100/70 px-3 py-2 text-sm text-amber-900">
              <span className="font-medium">What to ask for: </span>
              {mismatch.whatToAskFor}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
