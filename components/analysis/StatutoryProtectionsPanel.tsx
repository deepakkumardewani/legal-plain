"use client";

import type { StatutoryProtection } from "@/lib/types";

interface StatutoryProtectionsPanelProps {
  protections: StatutoryProtection[] | undefined;
}

export function StatutoryProtectionsPanel({ protections }: StatutoryProtectionsPanelProps) {
  if (!protections || protections.length === 0) return null;

  const scrollToClause = (clauseId: string) => {
    const el = document.getElementById(`clause-${clauseId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section className="rounded-lg border border-teal-200 bg-teal-50/50 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-teal-900">
        Your rights regardless of this contract
      </h2>
      <p className="mt-1 text-sm text-teal-700">
        These statutory protections apply no matter what this document says. The law overrides
        conflicting contract terms.
      </p>
      <ul className="mt-4 space-y-3">
        {protections.map((p) => (
          <li key={p.name} className="rounded-md bg-white p-4 border border-teal-100">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium text-gray-900">{p.name}</h3>
                <p className="mt-1 text-sm text-gray-600">{p.summary}</p>
                <p className="mt-1 text-xs text-gray-400">{p.jurisdiction}</p>
              </div>
            </div>
            {p.overridesClauseId && (
              <button
                type="button"
                className="mt-2 text-sm font-medium text-teal-700 underline hover:text-teal-600"
                onClick={() => scrollToClause(p.overridesClauseId!)}
              >
                See affected clause →
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
