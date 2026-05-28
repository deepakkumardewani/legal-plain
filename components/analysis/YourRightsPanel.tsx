interface YourRightsPanelProps {
  rights: string[];
}

export function YourRightsPanel({ rights }: YourRightsPanelProps) {
  if (rights.length === 0) return null;

  return (
    <section className="rounded-2xl border border-[#e6dccd] bg-[#fffdf8] p-6 shadow-[0_20px_70px_-58px_rgba(74,55,31,0.65)] md:p-7">
      <h2
        className="text-lg font-semibold text-[#18181f]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Your Rights
      </h2>
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
    </section>
  );
}
