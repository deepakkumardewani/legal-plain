"use client";

import type { Contradiction } from "@/lib/types";
import { useClauseNav } from "./ClauseNavigationContext";
import { ClauseLink } from "./ClauseLink";
import { PanelCard } from "./PanelCard";

interface ContradictionsPanelProps {
  contradictions: Contradiction[] | undefined;
}

export function ContradictionsPanel({ contradictions }: ContradictionsPanelProps) {
  const { goToClause } = useClauseNav();

  if (!contradictions || contradictions.length === 0) return null;

  return (
    <PanelCard
      className="border-[#ecd9b8] bg-[#fef9ee]"
      titleClassName="text-[#8a5a12]"
      subtitleClassName="text-[#8a5a12]"
      title="Contradictions Found"
      subtitle="These clauses say different things. The contract is inconsistent — you should ask for clarification before signing."
    >
      <ul className="mt-4 space-y-3">
        {contradictions.map((c, i) => (
          <li key={i} className="rounded-xl border border-[#ecd9b8] bg-[#fffdf8] p-4">
            <p className="text-sm text-[#4a4a52]">{c.description}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {c.clauseIds.map((clauseId) => (
                <ClauseLink
                  key={clauseId}
                  className="text-[#c8791a] hover:text-[#ad6414] focus-visible:ring-[#c8791a]/40"
                  onClick={() => goToClause(clauseId)}
                >
                  See clause {clauseId} →
                </ClauseLink>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}
