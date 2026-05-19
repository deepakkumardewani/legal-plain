interface YourRightsPanelProps {
  rights: string[];
}

export function YourRightsPanel({ rights }: YourRightsPanelProps) {
  if (rights.length === 0) return null;

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Your Rights</h2>
      <ul className="mt-4 space-y-2">
        {rights.map((right) => (
          <li key={right} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
            {right}
          </li>
        ))}
      </ul>
    </section>
  );
}
