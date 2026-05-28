"use client";

import { useState } from "react";
import type { ClauseAnalysis } from "@/lib/types";
import { CompareToStandard } from "./CompareToStandard";
import { useClauseNav } from "./ClauseNavigationContext";
import { cn, clauseNumber } from "@/lib/utils";

const borderColors: Record<string, string> = {
  RED: "border-l-[#c0392b]/55",
  YELLOW: "border-l-[#b45309]/55",
  CONTEXT_DEPENDENT: "border-l-[#b8aea0]",
  GREEN: "border-l-[#2d6a4f]/55",
};

const badgeStyles: Record<string, string> = {
  RED: "bg-[#fdf2f0] text-[#8b2e24]",
  YELLOW: "bg-[#fef9ee] text-[#8a5a12]",
  CONTEXT_DEPENDENT: "bg-[#f5f0e8] text-[#5c5c66]",
  GREEN: "bg-[#edf7f2] text-[#1f5c40]",
};

const riskLabels: Record<string, string> = {
  RED: "Red Flag",
  YELLOW: "Unusual",
  CONTEXT_DEPENDENT: "Context-Dependent",
  GREEN: "Standard",
};

interface ClauseCardProps {
  clause: ClauseAnalysis;
}

export function ClauseCard({ clause }: ClauseCardProps) {
  const [showOriginal, setShowOriginal] = useState(false);
  const { flashId } = useClauseNav();

  return (
    <div
      id={`clause-${clause.id}`}
      className={cn(
        "rounded-xl border border-[#e6dccd] bg-[#fffdf8] p-4 shadow-[0_16px_50px_-48px_rgba(74,55,31,0.55)] md:rounded-2xl md:p-5",
        "border-l-4",
        borderColors[clause.riskLevel],
        flashId === clause.id && "clause-flash",
      )}
    >
      {clause.dealBreaker && (
        <div className="-mx-4 -mt-4 mb-4 rounded-t-xl bg-[#c0392b] px-4 py-2 text-center text-sm font-semibold text-white md:-mx-5 md:-mt-5 md:rounded-t-2xl">
          Walk-away clause — read this first
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              badgeStyles[clause.riskLevel],
            )}
          >
            {riskLabels[clause.riskLevel]}
          </span>
          {clause.confidence === "LOW" && (
            <span
              title="The model is unsure about this reading — e.g. vague wording, uncommon jurisdiction, or facts not in the document."
              className="inline-flex items-center rounded-full bg-[#f5f0e8] px-2 py-0.5 text-xs font-medium text-[#737373]"
            >
              Low confidence
            </span>
          )}
          <span
            className="inline-flex shrink-0 items-center rounded bg-[#f5f0e8] px-1.5 py-0.5 font-mono text-xs tabular-nums text-[#5c5c66]"
            aria-label={`Clause ${clauseNumber(clause.id)}`}
          >
            #{clauseNumber(clause.id)}
          </span>
          <h3
            className="text-base font-semibold text-[#18181f]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {clause.title}
          </h3>
        </div>
        {clause.affectedByMismatch && (
          <span className="shrink-0 rounded-full bg-[#fef9ee] px-2 py-0.5 text-xs font-medium text-[#8a5a12]">
            Mismatch affected
          </span>
        )}
        {clause.incorporatedReferences && clause.incorporatedReferences.length > 0 && (
          <span className="shrink-0 rounded-full bg-[#fef9ee] px-2 py-0.5 text-xs font-medium text-[#ad6414]">
            {clause.incorporatedReferences.length === 1
              ? `References ${clause.incorporatedReferences[0]} (not shown)`
              : `References ${clause.incorporatedReferences.length} external documents`}
          </span>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-[#4a4a52]">{clause.plainEnglish}</p>

      <div className="mt-2 rounded-lg bg-[#f5f0e8] px-3 py-2 text-sm text-[#5c5c66]">
        <span className="font-medium text-[#18181f]">Why: </span>
        {clause.riskReason}
      </div>

      {clause.vaguenessFlags && clause.vaguenessFlags.length > 0 && (
        <p className="mt-1 text-sm text-[#8a5a12]">
          Watch for discretionary language:{" "}
          {clause.vaguenessFlags.map((f, i) => (
            <span key={f}>
              &lsquo;{f}&rsquo;
              {i < clause.vaguenessFlags!.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      )}

      <CompareToStandard text={clause.comparisonToStandard} />

      <div className="mt-2 text-sm text-[#4a4a52]">
        <span className="font-medium text-[#18181f]">Your obligation: </span>
        {clause.obligation}
      </div>

      {clause.riskLevel !== "GREEN" &&
        clause.riskLevel !== "CONTEXT_DEPENDENT" &&
        clause.negotiationTip && (
          <div className="mt-2 rounded-lg bg-[#f7efe2] px-3 py-2 text-sm text-[#6b4a12]">
            <span className="font-medium">
              {clause.negotiability === "TAKE_IT_OR_LEAVE_IT"
                ? "What you can do: "
                : clause.negotiability === "LOW"
                  ? "Hard to negotiate — "
                  : clause.negotiability === "MEDIUM"
                    ? "Likely negotiable — "
                    : clause.negotiability === "HIGH"
                      ? "Negotiation tip: "
                      : "Negotiation tip: "}
            </span>
            {clause.negotiationTip}
          </div>
        )}

      {clause.riskLevel === "CONTEXT_DEPENDENT" && clause.contextNote && (
        <div className="mt-2 rounded-lg bg-[#f5f0e8] px-3 py-2 text-sm italic text-[#5c5c66]">
          {clause.contextNote}
        </div>
      )}

      {clause.originalExcerpt !== null ? (
        <>
          <button
            type="button"
            className="mt-3 text-sm font-medium text-[#c8791a] transition-colors hover:text-[#ad6414] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8791a]/40"
            onClick={() => setShowOriginal(!showOriginal)}
            aria-expanded={showOriginal}
          >
            {showOriginal ? "Hide original text" : "View original text"}
          </button>

          {showOriginal && (
            <pre className="mt-2 overflow-x-auto rounded-lg bg-[#f5f0e8] p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-[#4a4a52]">
              {clause.originalExcerpt}
            </pre>
          )}
        </>
      ) : (
        <p className="mt-3 text-sm italic text-[#737373]">
          Source text not quotable — see plain-English explanation above.
        </p>
      )}
    </div>
  );
}
