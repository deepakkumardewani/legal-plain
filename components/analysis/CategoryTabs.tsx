"use client";

import type { RiskLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Tab {
  level: RiskLevel;
  label: string;
  count: number;
  activeColor: string;
}

interface CategoryTabsProps {
  activeTab: RiskLevel;
  onTabChange: (tab: RiskLevel) => void;
  redFlagCount: number;
  unusualCount: number;
  contextDependentCount: number;
  standardCount: number;
}

export function CategoryTabs({
  activeTab,
  onTabChange,
  redFlagCount,
  unusualCount,
  contextDependentCount,
  standardCount,
}: CategoryTabsProps) {
  const tabs: Tab[] = [
    {
      level: "RED",
      label: "Red Flags",
      count: redFlagCount,
      activeColor: "border-[#c0392b] text-[#8b2e24]",
    },
    {
      level: "YELLOW",
      label: "Unusual",
      count: unusualCount,
      activeColor: "border-[#b45309] text-[#8a5a12]",
    },
    {
      level: "CONTEXT_DEPENDENT",
      label: "Context-Dependent",
      count: contextDependentCount,
      activeColor: "border-[#8a8175] text-[#5c5c66]",
    },
    {
      level: "GREEN",
      label: "Standard",
      count: standardCount,
      activeColor: "border-[#2d6a4f] text-[#1f5c40]",
    },
  ];

  return (
    <div role="tablist" className="flex overflow-x-auto border-b border-[#e6dccd]">
      {tabs.map((tab) => (
        <button
          key={tab.level}
          role="tab"
          aria-selected={activeTab === tab.level}
          className={cn(
            "flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8791a]/40 focus-visible:ring-offset-2",
            activeTab === tab.level
              ? cn("border-b-2", tab.activeColor)
              : "border-transparent text-[#737373] hover:text-[#4a4a52]",
          )}
          onClick={() => onTabChange(tab.level)}
        >
          {tab.label}
          <span
            className={cn(
              "inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-xs tabular-nums",
              activeTab === tab.level
                ? "bg-[#c8791a]/12 text-[#ad6414]"
                : "bg-[#f5f0e8] text-[#737373]",
            )}
          >
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}
