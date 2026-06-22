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

interface PendingEntry {
  question: string;
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

interface ThreadMessageProps {
  entry: FollowUpEntry;
  idToClause: Map<string, ClauseAnalysis>;
  goToClause: (id: string) => void;
}

function ThreadMessage({ entry, idToClause, goToClause }: ThreadMessageProps) {
  return (
    <div className="space-y-3">
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
              <ClauseChip key={id} id={id} clause={idToClause.get(id)} onNavigate={goToClause} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div
      className="space-y-2 px-4 py-4"
      role="status"
      aria-label="Generating answer"
    >
      <span className="sr-only">Generating answer…</span>
      <div className="h-3 w-3/4 animate-pulse rounded-full bg-[#e6dccd]" />
      <div className="h-3 w-1/2 animate-pulse rounded-full bg-[#e6dccd]" style={{ animationDelay: "150ms" }} />
      <div className="h-3 w-2/3 animate-pulse rounded-full bg-[#e6dccd]" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

export function FollowUpInput({ analysis, documentText }: FollowUpInputProps) {
  const { goToClause, idToClause } = useClauseNav();
  const [question, setQuestion] = useState("");
  const [remaining, setRemaining] = useState(analysis.followUpQuestionsRemaining);
  const [thread, setThread] = useState<FollowUpEntry[]>([]);
  const [pending, setPending] = useState<PendingEntry | null>(null);
  const [usedSuggestions, setUsedSuggestions] = useState<Set<string>>(new Set());
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

      // Show question immediately before API call
      setPending({ question: trimmed });
      setLoading(true);
      setError(null);
      setQuestion("");

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
          setPending(null);
          setError(data.error || "Something went wrong. Please try again.");
          return;
        }

        setPending(null);
        setThread((prev) => [
          ...prev,
          {
            question: trimmed,
            answer: data.answer,
            citedClauseIds: data.citedClauseIds || [],
          },
        ]);
        setRemaining(data.remaining);
        inputRef.current?.focus();
      } catch {
        setPending(null);
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
      setUsedSuggestions((prev) => new Set(prev).add(suggested));
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

  const hasThread = thread.length > 0 || loading || pending !== null;
  const availableSuggestions = SUGGESTED_QUESTIONS.filter((q) => !usedSuggestions.has(q));

  return (
    <section className="mt-8 rounded-xl border border-[#e6dccd] bg-[#fbf8f1] shadow-sm">
      {/* Header */}
      <div className="border-b border-[#e6dccd] px-6 py-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-[family-name:var(--font-bricolage)] text-lg font-semibold text-[#18181f]">
            Ask a Follow-Up Question
          </h2>
          <span className="shrink-0 text-xs text-[#9c9690]">
            {hasUnlimitedQuestions
              ? "Unlimited questions"
              : remaining > 0
                ? `${remaining} question${remaining === 1 ? "" : "s"} remaining`
                : "No questions remaining"}
          </span>
        </div>
      </div>

      {/* Thread */}
      {hasThread && (
        <div
          className="space-y-5 px-6 py-5"
          role="log"
          aria-live="polite"
          aria-label="Question thread"
        >
          {thread.map((entry, idx) => (
            <ThreadMessage
              key={idx}
              entry={entry}
              idToClause={idToClause}
              goToClause={goToClause}
            />
          ))}
          {/* Optimistic pending question + loading indicator */}
          {pending && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-[#c8791a] px-4 py-2.5 text-sm text-white">
                  {pending.question}
                </div>
              </div>
              <div className="max-w-[90%] rounded-2xl rounded-bl-sm border border-[#e6dccd] bg-white shadow-sm">
                <TypingIndicator />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Composer */}
      <div className={cn("px-6 pb-6", hasThread ? "pt-0" : "pt-5")}>
        {/* Suggestions — full prompt on empty state, compact chips when thread exists */}
        {!hasThread && availableSuggestions.length > 0 && (
          <div className="mb-4" role="region" aria-label="Suggested questions">
            <p className="mb-2 text-sm text-[#6b6560]">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {availableSuggestions.map((suggested) => (
                <button
                  key={suggested}
                  type="button"
                  disabled={disabled}
                  className={cn(
                    "rounded-full border border-[#e6dccd] bg-[#fffdf8] px-3 py-1.5 text-sm text-[#18181f] transition-colors",
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
        {hasThread && availableSuggestions.length > 0 && (
          <div
            className="mb-3 flex flex-wrap items-center gap-2"
            role="region"
            aria-label="Suggested questions"
          >
            <span className="text-xs font-medium text-[#9c9690]">Suggested:</span>
            {availableSuggestions.map((suggested) => (
              <button
                key={suggested}
                type="button"
                disabled={disabled}
                className={cn(
                  "rounded-full border border-[#e6dccd] bg-[#fffdf8] px-2.5 py-1 text-xs text-[#6b6560] transition-colors",
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
        )}

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
                ? "cursor-not-allowed bg-[#e6dccd] text-[#a3a0a8]"
                : "bg-[#18181f] text-white hover:bg-[#2d2d3a]",
            )}
            onClick={handleSubmit}
            disabled={disabled || !question.trim() || overCap}
          >
            Ask
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}
      </div>
    </section>
  );
}
