interface ObligationsPanelProps {
  obligations: string[];
}

export function ObligationsPanel({ obligations }: ObligationsPanelProps) {
  if (obligations.length === 0) return null;

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Your Obligations</h2>
      <ul className="mt-4 space-y-2">
        {obligations.map((obligation) => (
          <li key={obligation} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
            {obligation}
          </li>
        ))}
      </ul>
    </section>
  );
}
