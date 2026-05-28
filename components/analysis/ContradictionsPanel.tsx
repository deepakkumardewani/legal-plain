"use client";

import type { Contradiction } from "@/lib/types";
import { useClauseNav } from "./ClauseNavigationContext";

interface ContradictionsPanelProps {
  contradictions: Contradiction[] | undefined;
}

export function ContradictionsPanel({ contradictions }: ContradictionsPanelProps) {
  const { goToClause } = useClauseNav();

  if (!contradictions || contradictions.length === 0) return null;

  return (
    <section className="rounded-2xl border border-[#ecd9b8] bg-[#fef9ee] p-6 shadow-[0_20px_70px_-58px_rgba(74,55,31,0.65)] md:p-7">
      <h2
        className="text-lg font-semibold text-[#8a5a12]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Contradictions Found
      </h2>
      <p className="mt-1 text-sm text-[#8a5a12]">
        These clauses say different things. The contract is inconsistent — you should ask for
        clarification before signing.
      </p>
      <ul className="mt-4 space-y-3">
        {contradictions.map((c, i) => (
          <li key={i} className="rounded-xl border border-[#ecd9b8] bg-[#fffdf8] p-4">
            <p className="text-sm text-[#4a4a52]">{c.description}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {c.clauseIds.map((clauseId) => (
                <button
                  key={clauseId}
                  type="button"
                  className="text-sm font-medium text-[#c8791a] underline transition-colors hover:text-[#ad6414] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8791a]/40"
                  onClick={() => goToClause(clauseId)}
                >
                  See clause {clauseId} →
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
