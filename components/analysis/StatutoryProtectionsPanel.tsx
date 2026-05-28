"use client";

import type { StatutoryProtection } from "@/lib/types";
import { useClauseNav } from "./ClauseNavigationContext";

interface StatutoryProtectionsPanelProps {
  protections: StatutoryProtection[] | undefined;
}

export function StatutoryProtectionsPanel({ protections }: StatutoryProtectionsPanelProps) {
  const { goToClause } = useClauseNav();

  if (!protections || protections.length === 0) return null;

  return (
    <section className="rounded-2xl border border-[#c5ddd0] bg-[#edf7f2] p-6 shadow-[0_20px_70px_-58px_rgba(74,55,31,0.65)] md:p-7">
      <h2
        className="text-lg font-semibold text-[#1f5c40]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Your rights regardless of this contract
      </h2>
      <p className="mt-1 text-sm text-[#2d6a4f]">
        These statutory protections apply no matter what this document says. The law overrides
        conflicting contract terms.
      </p>
      <ul className="mt-4 space-y-3">
        {protections.map((p) => (
          <li key={p.name} className="rounded-xl border border-[#c5ddd0] bg-[#fffdf8] p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3
                  className="font-medium text-[#18181f]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {p.name}
                </h3>
                <p className="mt-1 text-sm text-[#4a4a52]">{p.summary}</p>
                <p className="mt-1 text-xs text-[#737373]">{p.jurisdiction}</p>
              </div>
            </div>
            {p.overridesClauseId && (
              <button
                type="button"
                className="mt-2 text-sm font-medium text-[#2d6a4f] underline transition-colors hover:text-[#1f5c40] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d6a4f]/40"
                onClick={() => goToClause(p.overridesClauseId!)}
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
