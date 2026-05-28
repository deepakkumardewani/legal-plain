"use client";

import { useState, useCallback, useRef } from "react";
import type { AnalysisResult } from "@/lib/types";
import { getOrCreateUserId } from "@/lib/userId";
import { cn } from "@/lib/utils";

interface FollowUpEntry {
  question: string;
  answer: string;
  citedClauseIds: string[];
}

interface FollowUpInputProps {
  analysis: AnalysisResult;
  documentText: string;
}

const CLAUSE_ID_RE = /\[([a-zA-Z0-9-]+)\]/g;
const UNLIMITED_REMAINING_THRESHOLD = 1_000_000;

function renderAnswer(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const regex = new RegExp(CLAUSE_ID_RE.source, "g");
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const clauseId = match[1]!;
    parts.push(
      <button
        key={`${clauseId}-${match.index}`}
        type="button"
        className="font-medium text-blue-600 underline hover:text-blue-800"
        onClick={() => {
          const el = document.getElementById(`clause-${clauseId}`);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
        }}
      >
        [{clauseId}]
      </button>,
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export function FollowUpInput({ analysis, documentText }: FollowUpInputProps) {
  const [question, setQuestion] = useState("");
  const [remaining, setRemaining] = useState(analysis.followUpQuestionsRemaining);
  const [thread, setThread] = useState<FollowUpEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hasUnlimitedQuestions = remaining >= UNLIMITED_REMAINING_THRESHOLD;
  const disabled = (!hasUnlimitedQuestions && remaining === 0) || loading;
  const overCap = question.length > 500;

  const handleSubmit = useCallback(async () => {
    const trimmed = question.trim();
    if (!trimmed || overCap || disabled) return;

    setLoading(true);
    setError(null);

    try {
      const userId = await getOrCreateUserId();
      const res = await fetch("/api/followup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({
          question: trimmed,
          analysisResult: analysis,
          documentText,
          analysisId: analysis.analysisId,
          userId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setThread((prev) => [
        ...prev,
        {
          question: trimmed,
          answer: data.answer,
          citedClauseIds: data.citedClauseIds || [],
        },
      ]);
      setRemaining(data.remaining);
      setQuestion("");
      inputRef.current?.focus();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [question, overCap, disabled, analysis, documentText]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <section className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Ask a Follow-Up Question</h2>
      <p className="mt-1 text-sm text-gray-500">
        {hasUnlimitedQuestions
          ? "Unlimited questions for this analysis"
          : remaining > 0
            ? `${remaining} question${remaining === 1 ? "" : "s"} remaining`
            : "No questions remaining for this analysis"}
      </p>

      <div className="mt-4">
        <textarea
          ref={inputRef}
          className={cn(
            "w-full rounded-md border p-3 text-sm resize-none",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "border-gray-300",
          )}
          rows={3}
          placeholder={
            !hasUnlimitedQuestions && remaining === 0
              ? "Question limit reached"
              : "Ask anything about this contract…"
          }
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          maxLength={500}
          aria-label="Follow-up question"
        />

        <div className="mt-2 flex items-center justify-between">
          <span
            className={cn(
              "text-xs",
              question.length >= 450 ? "text-amber-600 font-medium" : "text-gray-400",
            )}
          >
            {question.length}/500
          </span>
          <button
            type="button"
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              disabled || !question.trim() || overCap
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700",
            )}
            onClick={handleSubmit}
            disabled={disabled || !question.trim() || overCap}
          >
            {loading ? "Sending…" : "Ask"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      {thread.length > 0 && (
        <div className="mt-6 space-y-4">
          {thread.map((entry, idx) => (
            <div key={idx} className="rounded-md bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-900">{entry.question}</p>
              <div className="mt-2 text-sm leading-relaxed text-gray-700">
                {renderAnswer(entry.answer)}
              </div>
              {entry.citedClauseIds.length > 0 && (
                <p className="mt-2 text-xs text-gray-400">
                  Cited: {entry.citedClauseIds.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
