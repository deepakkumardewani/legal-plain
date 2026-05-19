import type { MissingClause } from "@/lib/types";

interface MissingClausesPanelProps {
  clauses: MissingClause[];
}

export function MissingClausesPanel({ clauses }: MissingClausesPanelProps) {
  if (clauses.length === 0) return null;

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Missing Clauses</h2>
      <p className="mt-1 text-sm text-gray-500">
        These standard clauses were not found in your contract. Consider asking for them.
      </p>
      <ul className="mt-4 space-y-4">
        {clauses.map((clause) => (
          <li key={clause.title} className="rounded-md bg-gray-50 p-4">
            <h3 className="font-medium text-gray-900">{clause.title}</h3>
            <p className="mt-1 text-sm text-gray-600">{clause.whyItMatters}</p>
            <p className="mt-2 text-sm text-purple-700">
              <span className="font-medium">What to ask for: </span>
              {clause.whatToAskFor}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
