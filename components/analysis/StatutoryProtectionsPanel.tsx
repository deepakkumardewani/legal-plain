"use client";

import type { StatutoryProtection } from "@/lib/types";
import { useClauseNav } from "./ClauseNavigationContext";
import { ClauseLink } from "./ClauseLink";
import { PanelCard } from "./PanelCard";

interface StatutoryProtectionsPanelProps {
  protections: StatutoryProtection[] | undefined;
}

export function StatutoryProtectionsPanel({ protections }: StatutoryProtectionsPanelProps) {
  const { goToClause } = useClauseNav();

  if (!protections || protections.length === 0) return null;

  return (
    <PanelCard
      className="border-[#c5ddd0] bg-[#edf7f2]"
      titleClassName="text-[#1f5c40]"
      subtitleClassName="text-[#2d6a4f]"
      title="Your rights regardless of this contract"
      subtitle="These statutory protections apply no matter what this document says. The law overrides conflicting contract terms."
    >
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
              <ClauseLink
                className="mt-2 text-[#2d6a4f] hover:text-[#1f5c40] focus-visible:ring-[#2d6a4f]/40"
                onClick={() => goToClause(p.overridesClauseId!)}
              >
                See affected clause →
              </ClauseLink>
            )}
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}
