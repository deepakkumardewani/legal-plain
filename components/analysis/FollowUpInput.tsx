"use client";

import { useState, useCallback, useRef } from "react";
import type { AnalysisResult, ClauseAnalysis } from "@/lib/types";
import { getOrCreateUserId } from "@/lib/userId";
import { cn, clauseNumber, findClauseReferences } from "@/lib/utils";
import { useClauseNav } from "./ClauseNavigationContext";

interface FollowUpEntry {
  question: string;
  answer: string;
  citedClauseIds: string[];
}

interface FollowUpInputProps {
  analysis: AnalysisResult;
  documentText: string;
}

const UNLIMITED_REMAINING_THRESHOLD = 1_000_000;

const SUGGESTED_QUESTIONS = [
  "What happens if I break the NDA?",
  "What are the main risks in this contract?",
  "Which clauses should I negotiate?",
  "What are my key obligations?",
];

function clauseChipLabel(
  clause: ClauseAnalysis | undefined,
  id: string,
  variant: "inline" | "full" = "full",
): string {
  const num = clauseNumber(id);
  if (variant === "inline") return `#${num}`;
  if (clause) return `${clause.title} #${num}`;
  return `#${num}`;
}

interface ClauseChipProps {
  id: string;
  clause: ClauseAnalysis | undefined;
  onNavigate: (id: string) => void;
  variant?: "inline" | "full";
}

function ClauseChip({ id, clause, onNavigate, variant = "full" }: ClauseChipProps) {
  const label = clauseChipLabel(clause, id, variant);
  const fullLabel = clauseChipLabel(clause, id, "full");

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center rounded-full border border-[#c8791a]/30 bg-[#c8791a]/10 font-medium text-[#ad6414] transition-colors hover:border-[#c8791a]/50 hover:bg-[#c8791a]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8791a]/40",
        variant === "inline"
          ? "mx-0.5 px-1.5 py-px font-mono text-xs tabular-nums"
          : "gap-1 px-2.5 py-0.5 text-xs",
      )}
      aria-label={variant === "inline" ? `Go to ${fullLabel}` : undefined}
      onClick={() => onNavigate(id)}
    >
      {label}
    </button>
  );
}

function renderAnswer(
  text: string,
  idToClause: Map<string, ClauseAnalysis>,
  goToClause: (id: string) => void,
): React.ReactNode {
  const references = findClauseReferences(text);
  if (references.length === 0) return text;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const ref of references) {
    if (ref.index > lastIndex) {
      parts.push(text.slice(lastIndex, ref.index));
    }
    parts.push(
      <ClauseChip
        key={`${ref.id}-${ref.index}`}
        id={ref.id}
        clause={idToClause.get(ref.id)}
        onNavigate={goToClause}
        variant="inline"
      />,
    );
    lastIndex = ref.index + ref.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1.5 px-4 py-3"
      role="status"
      aria-label="Generating answer"
    >
      <span className="sr-only">Generating answer…</span>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 animate-bounce rounded-full bg-[#c8791a]/60"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

export function FollowUpInput({ analysis, documentText }: FollowUpInputProps) {
  const { goToClause, idToClause } = useClauseNav();
  const [question, setQuestion] = useState("");
  const [remaining, setRemaining] = useState(analysis.followUpQuestionsRemaining);
  const [thread, setThread] = useState<FollowUpEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hasUnlimitedQuestions = remaining >= UNLIMITED_REMAINING_THRESHOLD;
  const disabled = (!hasUnlimitedQuestions && remaining === 0) || loading;
  const overCap = question.length > 500;

  const submitQuestion = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || trimmed.length > 500 || disabled) return;

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
    },
    [disabled, analysis, documentText],
  );

  const handleSubmit = useCallback(() => {
    submitQuestion(question);
  }, [question, submitQuestion]);

  const handleSuggestedClick = useCallback(
    (suggested: string) => {
      setQuestion(suggested);
      submitQuestion(suggested);
    },
    [submitQuestion],
  );

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
    <section className="mt-8 rounded-lg border border-[#e6dccd] bg-[#fffdf8] p-6 shadow-sm">
      <h2 className="font-[family-name:var(--font-bricolage)] text-lg font-semibold text-[#18181f]">
        Ask a Follow-Up Question
      </h2>
      <p className="mt-1 text-sm text-[#6b6560]">
        {hasUnlimitedQuestions
          ? "Unlimited questions for this analysis"
          : remaining > 0
            ? `${remaining} question${remaining === 1 ? "" : "s"} remaining`
            : "No questions remaining for this analysis"}
      </p>

      {thread.length === 0 && !loading && (
        <div className="mt-5" role="region" aria-label="Suggested questions">
          <p className="text-sm text-[#6b6560]">Try asking:</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((suggested) => (
              <button
                key={suggested}
                type="button"
                disabled={disabled}
                className={cn(
                  "rounded-full border border-[#e6dccd] bg-[#fbf8f1] px-3 py-1.5 text-sm text-[#18181f] transition-colors",
                  disabled
                    ? "cursor-not-allowed opacity-50"
                    : "hover:border-[#c8791a]/40 hover:bg-[#c8791a]/10 hover:text-[#ad6414]",
                )}
                onClick={() => handleSuggestedClick(suggested)}
              >
                {suggested}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <textarea
          ref={inputRef}
          className={cn(
            "w-full resize-none rounded-xl border p-3 text-sm transition-colors",
            "focus:border-[#c8791a] focus:outline-none focus:ring-2 focus:ring-[#c8791a]/20",
            disabled
              ? "cursor-not-allowed border-[#e6dccd] bg-[#f5f0e8] text-[#a3a0a8]"
              : "border-[#d8d2c6] bg-white text-[#18181f]",
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
              question.length >= 450 ? "font-medium text-[#c8791a]" : "text-[#a3a0a8]",
            )}
          >
            {question.length}/500
          </span>
          <button
            type="button"
            className={cn(
              "rounded-full px-5 py-1.5 text-sm font-semibold transition-colors",
              disabled || !question.trim() || overCap
                ? "cursor-not-allowed bg-[#f5f0e8] text-[#a3a0a8]"
                : "bg-[#c8791a] text-white hover:bg-[#ad6414]",
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

      {(thread.length > 0 || loading) && (
        <div className="mt-6 space-y-4" role="log" aria-live="polite" aria-label="Question thread">
          {thread.map((entry, idx) => (
            <div key={idx} className="space-y-3">
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-[#c8791a] px-4 py-2.5 text-sm text-white">
                  {entry.question}
                </div>
              </div>
              <div className="max-w-[90%] rounded-2xl rounded-bl-sm border border-[#e6dccd] bg-white px-4 py-3 shadow-sm">
                <div className="text-sm leading-relaxed text-[#18181f]">
                  {renderAnswer(entry.answer, idToClause, goToClause)}
                </div>
                {entry.citedClauseIds.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#e6dccd] pt-3">
                    <span className="text-xs font-medium text-[#6b6560]">Cited:</span>
                    {entry.citedClauseIds.map((id) => (
                      <ClauseChip
                        key={id}
                        id={id}
                        clause={idToClause.get(id)}
                        onNavigate={goToClause}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="max-w-[90%] rounded-2xl rounded-bl-sm border border-[#e6dccd] bg-white shadow-sm">
              <TypingIndicator />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
