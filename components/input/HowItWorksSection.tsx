const STEPS = [
  {
    num: "01",
    title: "Add your document",
    desc: "Upload a PDF or paste the contract text — no account needed.",
  },
  {
    num: "02",
    title: "AI reviews every clause",
    desc: "Flags risks, missing terms, and unusual provisions in plain English.",
  },
  {
    num: "03",
    title: "See your findings",
    desc: "Risk score and clause-by-clause breakdown, ready in minutes.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section className="border-t border-[#e6dccd] pt-5">
      <p
        className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-[#a3967e]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        How it works
      </p>
      <ol className="grid gap-4 sm:grid-cols-3 sm:gap-6">
        {STEPS.map((step) => (
          <li key={step.num} className="flex gap-3">
            <span
              className="shrink-0 text-sm font-bold tabular-nums text-[#c8791a]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {step.num}
            </span>
            <div>
              <p
                className="text-sm font-semibold leading-snug text-[#18181f]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {step.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#70685d]">{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
