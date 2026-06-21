const STATS = [
  {
    value: "1–2 min",
    asterisk: true,
    label: "Average review time",
  },
  {
    value: "Every clause",
    asterisk: false,
    label: "Checked for risks & gaps",
  },
  {
    value: "Private",
    asterisk: false,
    label: "Results stay in your browser",
  },
] as const;

export function TrustStatsSection() {
  return (
    <section className="border-t border-[#e6dccd] pt-5">
      <dl className="grid gap-4 text-center sm:grid-cols-3 sm:gap-6">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <dt
              className="text-lg font-bold leading-tight text-[#18181f]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {stat.value}
              {stat.asterisk && <span className="align-super text-[#c8791a]">*</span>}
            </dt>
            <dd className="mt-1 text-xs leading-relaxed text-[#70685d]">{stat.label}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-center text-[11px] leading-relaxed text-[#a3967e]">
        *Estimate based on typical documents. Actual time varies by length and complexity.
      </p>
    </section>
  );
}
