import type { KeyDate } from "@/lib/types";
import { cn } from "@/lib/utils";

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
    <section className="rounded-2xl border border-[#e6dccd] bg-[#fffdf8] p-6 shadow-[0_20px_70px_-58px_rgba(74,55,31,0.65)] md:p-7">
      <h2
        className="text-lg font-semibold text-[#18181f]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Key Dates & Deadlines
      </h2>
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
    </section>
  );
}
