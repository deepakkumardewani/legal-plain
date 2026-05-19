import type { KeyDate } from "@/lib/types";
import { cn } from "@/lib/utils";

const urgencyStyles: Record<string, string> = {
  HIGH: "bg-red-100 text-red-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  LOW: "bg-green-100 text-green-800",
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
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Key Dates & Deadlines</h2>
      <ul className="mt-4 space-y-3">
        {sorted.map((date) => (
          <li key={date.label} className="flex items-center justify-between gap-3 rounded-md bg-gray-50 p-3">
            <div>
              <span className="text-sm font-medium text-gray-900">{date.label}</span>
              <p className="text-sm text-gray-600">{date.value}</p>
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
