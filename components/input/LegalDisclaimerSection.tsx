const POINTS = [
  {
    label: "Not legal advice",
    body: "LexLight provides general educational information only. It is not a substitute for advice from a licensed attorney.",
  },
  {
    label: "No attorney–client relationship",
    body: "Using this tool does not create an attorney–client relationship, and your use of it is not privileged or confidential.",
  },
  {
    label: "Consult a professional",
    body: "Laws vary by jurisdiction and circumstance. For matters of significant consequence, consult a qualified attorney before acting.",
  },
] as const;

export function LegalDisclaimerSection() {
  return (
    <section className="rounded-[1.5rem] border border-[#ecd9b4] bg-[#fbf3e3] px-5 py-4 md:px-6">
      <p
        className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[#b07a1f]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Important legal disclaimer
      </p>
      <dl className="space-y-2.5">
        {POINTS.map((point) => (
          <div key={point.label}>
            <dt className="text-sm font-semibold text-[#5c4a2a]">{point.label}</dt>
            <dd className="text-xs leading-relaxed text-[#7a6747]">{point.body}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
