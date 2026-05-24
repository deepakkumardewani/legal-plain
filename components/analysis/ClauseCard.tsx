"use client";

import { useState } from "react";
import type { ClauseAnalysis } from "@/lib/types";
import { CompareToStandard } from "./CompareToStandard";
import { cn } from "@/lib/utils";

const borderColors: Record<string, string> = {
  RED: "border-l-red-500",
  YELLOW: "border-l-yellow-500",
  CONTEXT_DEPENDENT: "border-l-gray-400",
  GREEN: "border-l-green-500",
};

const badgeStyles: Record<string, string> = {
  RED: "bg-red-100 text-red-800",
  YELLOW: "bg-yellow-100 text-yellow-800",
  CONTEXT_DEPENDENT: "bg-gray-100 text-gray-700",
  GREEN: "bg-green-100 text-green-800",
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

  return (
    <div
      id={`clause-${clause.id}`}
      className={cn(
        "rounded-lg border border-gray-200 bg-white p-4 shadow-sm",
        "border-l-4",
        borderColors[clause.riskLevel],
      )}
    >
      {clause.dealBreaker && (
        <div className="-mx-4 -mt-4 mb-4 rounded-t-lg bg-red-600 px-4 py-2 text-center text-sm font-semibold text-white">
          ⚠ Walk-away clause — read this first
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              badgeStyles[clause.riskLevel],
            )}
          >
            {riskLabels[clause.riskLevel]}
          </span>
          {clause.confidence === "LOW" && (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              Low confidence
            </span>
          )}
          <h3 className="text-base font-semibold text-gray-900">{clause.title}</h3>
        </div>
        {clause.affectedByMismatch && (
          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
            Mismatch affected
          </span>
        )}
        {clause.incorporatedReferences && clause.incorporatedReferences.length > 0 && (
          <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
            {clause.incorporatedReferences.length === 1
              ? `References ${clause.incorporatedReferences[0]} (not shown)`
              : `References ${clause.incorporatedReferences.length} external documents`}
          </span>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-gray-700">{clause.plainEnglish}</p>

      <div className="mt-2 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
        <span className="font-medium">Why: </span>
        {clause.riskReason}
      </div>

      {clause.vaguenessFlags && clause.vaguenessFlags.length > 0 && (
        <p className="mt-1 text-sm text-amber-700">
          ⚠ Watch for discretionary language:{" "}
          {clause.vaguenessFlags.map((f, i) => (
            <span key={f}>
              &lsquo;{f}&rsquo;
              {i < clause.vaguenessFlags!.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      )}

      <CompareToStandard text={clause.comparisonToStandard} />

      <div className="mt-2 text-sm text-gray-700">
        <span className="font-medium">Your obligation: </span>
        {clause.obligation}
      </div>

      {clause.riskLevel !== "GREEN" &&
        clause.riskLevel !== "CONTEXT_DEPENDENT" &&
        clause.negotiationTip && (
          <div className="mt-2 rounded-md bg-purple-50 px-3 py-2 text-sm text-purple-800">
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
        <div className="mt-2 rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 italic">
          {clause.contextNote}
        </div>
      )}

      {clause.originalExcerpt !== null ? (
        <>
          <button
            type="button"
            className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800"
            onClick={() => setShowOriginal(!showOriginal)}
            aria-expanded={showOriginal}
          >
            {showOriginal ? "Hide original text" : "View original text"}
          </button>

          {showOriginal && (
            <pre className="mt-2 overflow-x-auto rounded-md bg-gray-50 p-3 font-mono text-xs leading-relaxed text-gray-700 whitespace-pre-wrap">
              {clause.originalExcerpt}
            </pre>
          )}
        </>
      ) : (
        <p className="mt-3 text-sm italic text-gray-400">
          Source text not quotable — see plain-English explanation above.
        </p>
      )}
    </div>
  );
}
