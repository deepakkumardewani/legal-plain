import { PanelCard } from "./PanelCard";

interface ObligationsPanelProps {
  obligations: string[];
}

export function ObligationsPanel({ obligations }: ObligationsPanelProps) {
  if (obligations.length === 0) return null;

  return (
    <PanelCard
      className="border-[#e6dccd] bg-[#fffdf8]"
      titleClassName="text-[#18181f]"
      title="Your Obligations"
    >
      <ul className="mt-4 space-y-2">
        {obligations.map((obligation) => (
          <li key={obligation} className="flex items-start gap-2 text-sm text-[#4a4a52]">
            <span
              className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-[#c8791a]"
              aria-hidden
            />
            {obligation}
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}
