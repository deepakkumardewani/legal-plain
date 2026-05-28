import type { MissingClause } from "@/lib/types";

interface MissingClausesPanelProps {
  clauses: MissingClause[];
}

export function MissingClausesPanel({ clauses }: MissingClausesPanelProps) {
  if (clauses.length === 0) return null;

  return (
    <section
      id="panel-missing-clauses"
      className="rounded-2xl border border-[#e6dccd] bg-[#fffdf8] p-6 shadow-[0_20px_70px_-58px_rgba(74,55,31,0.65)] md:p-7"
    >
      <h2
        className="text-lg font-semibold text-[#18181f]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Missing Clauses
      </h2>
      <p className="mt-1 text-sm text-[#5c5c66]">
        These standard clauses were not found in your contract. Consider asking for them.
      </p>
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
    </section>
  );
}
