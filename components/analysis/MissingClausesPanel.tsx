import type { MissingClause } from "@/lib/types";
import { PanelCard } from "./PanelCard";

interface MissingClausesPanelProps {
  clauses: MissingClause[];
}

export function MissingClausesPanel({ clauses }: MissingClausesPanelProps) {
  if (clauses.length === 0) return null;

  return (
    <PanelCard
      className="border-[#e6dccd] bg-[#fffdf8]"
      titleClassName="text-[#18181f]"
      subtitleClassName="text-[#5c5c66]"
      title="Missing Clauses"
      subtitle="These standard clauses were not found in your contract. Consider asking for them."
    >
      <ul className="mt-4 space-y-4">
        {clauses.map((clause) => (
          <li key={clause.title} className="rounded-xl bg-[#f5f0e8] p-4">
            <h3
              className="font-medium text-[#18181f]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {clause.title}
            </h3>
            <p className="mt-1 text-sm text-[#4a4a52]">{clause.whyItMatters}</p>
            <p className="mt-2 text-sm text-[#6b4a12]">
              <span className="font-medium">What to ask for: </span>
              {clause.whatToAskFor}
            </p>
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}
