"use client";

import type { RiskLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Tab {
  level: RiskLevel;
  label: string;
  count: number;
  emoji: string;
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
      emoji: "Red",
      activeColor: "border-red-500 text-red-700",
    },
    {
      level: "YELLOW",
      label: "Unusual",
      count: unusualCount,
      emoji: "Yellow",
      activeColor: "border-yellow-500 text-yellow-700",
    },
    {
      level: "CONTEXT_DEPENDENT",
      label: "Context-Dependent",
      count: contextDependentCount,
      emoji: "Context",
      activeColor: "border-gray-600 text-gray-700",
    },
    {
      level: "GREEN",
      label: "Standard",
      count: standardCount,
      emoji: "Green",
      activeColor: "border-green-500 text-green-700",
    },
  ];

  return (
    <div role="tablist" className="flex border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.level}
          role="tab"
          aria-selected={activeTab === tab.level}
          className={cn(
            "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
            activeTab === tab.level
              ? cn("border-b-2", tab.activeColor)
              : "border-transparent text-gray-500 hover:text-gray-700",
          )}
          onClick={() => onTabChange(tab.level)}
        >
          {tab.label}
          <span
            className={cn(
              "inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-xs",
              activeTab === tab.level ? "bg-gray-100" : "bg-gray-50 text-gray-500",
            )}
          >
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}
