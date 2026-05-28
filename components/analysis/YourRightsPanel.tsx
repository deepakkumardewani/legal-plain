import { PanelCard } from "./PanelCard";

interface YourRightsPanelProps {
  rights: string[];
}

export function YourRightsPanel({ rights }: YourRightsPanelProps) {
  if (rights.length === 0) return null;

  return (
    <PanelCard
      className="border-[#e6dccd] bg-[#fffdf8]"
      titleClassName="text-[#18181f]"
      title="Your Rights"
    >
      <ul className="mt-4 space-y-2">
        {rights.map((right) => (
          <li key={right} className="flex items-start gap-2 text-sm text-[#4a4a52]">
            <span
              className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-[#2d6a4f]"
              aria-hidden
            />
            {right}
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}
