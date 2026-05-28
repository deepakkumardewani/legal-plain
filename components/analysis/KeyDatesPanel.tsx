import type { KeyDate } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PanelCard } from "./PanelCard";

const urgencyStyles: Record<string, string> = {
  HIGH: "bg-[#fdf2f0] text-[#8b2e24]",
  MEDIUM: "bg-[#fef9ee] text-[#8a5a12]",
  LOW: "bg-[#edf7f2] text-[#1f5c40]",
};

const urgencyLabels: Record<string, string> = {
  HIGH: "Urgent",
  MEDIUM: "Moderate",
  LOW: "Info",
};

interface KeyDatesPanelProps {
  dates: KeyDate[];
}

export function KeyDatesPanel({ dates }: KeyDatesPanelProps) {
  if (dates.length === 0) return null;

  const sorted = [...dates].sort((a, b) => {
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return (order[a.urgency] ?? 2) - (order[b.urgency] ?? 2);
  });

  return (
    <PanelCard
      className="border-[#e6dccd] bg-[#fffdf8]"
      titleClassName="text-[#18181f]"
      title="Key Dates & Deadlines"
    >
      <ul className="mt-4 space-y-3">
        {sorted.map((date) => (
          <li
            key={date.label}
            className="flex items-center justify-between gap-3 rounded-xl bg-[#f5f0e8] p-3"
          >
            <div>
              <span className="text-sm font-medium text-[#18181f]">{date.label}</span>
              <p className="text-sm text-[#5c5c66]">{date.value}</p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                urgencyStyles[date.urgency],
              )}
            >
              {urgencyLabels[date.urgency]}
            </span>
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}
