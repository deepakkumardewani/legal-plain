"use client";

import type { Contradiction } from "@/lib/types";

interface ContradictionsPanelProps {
  contradictions: Contradiction[] | undefined;
}

export function ContradictionsPanel({ contradictions }: ContradictionsPanelProps) {
  if (!contradictions || contradictions.length === 0) return null;

  const scrollToClause = (clauseId: string) => {
    const el = document.getElementById(`clause-${clauseId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section className="rounded-lg border border-orange-200 bg-orange-50/50 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-orange-900">Contradictions Found</h2>
      <p className="mt-1 text-sm text-orange-700">
        These clauses say different things. The contract is inconsistent — you should ask for
        clarification before signing.
      </p>
      <ul className="mt-4 space-y-3">
        {contradictions.map((c, i) => (
          <li key={i} className="rounded-md bg-white p-4 border border-orange-100">
            <p className="text-sm text-gray-800">{c.description}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {c.clauseIds.map((clauseId) => (
                <button
                  key={clauseId}
                  type="button"
                  className="text-sm font-medium text-orange-700 underline hover:text-orange-600"
                  onClick={() => scrollToClause(clauseId)}
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
