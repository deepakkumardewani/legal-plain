export function HeroClauseCard() {
  return (
    <div
      className="lp-report-card relative w-[360px] select-none rounded-[1.75rem] p-7 xl:w-[430px]"
      style={{
        border: "1px solid rgba(245,240,232,0.10)",
        backgroundColor: "rgba(32,26,20,0.85)",
        boxShadow: "0 34px 90px -42px rgba(0,0,0,0.70)",
      }}
    >
      <div
        className="absolute inset-x-7 top-0 h-px"
        style={{
          background: "linear-gradient(to right, transparent, rgba(239,207,162,0.60), transparent)",
        }}
      />
      <div className="mb-6 flex items-center justify-between">
        <span
          className="rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
          style={{
            borderColor: "rgba(209,73,63,0.35)",
            backgroundColor: "rgba(209,73,63,0.10)",
            color: "#f06d61",
          }}
        >
          Red flag
        </span>
        <span className="text-xs font-medium" style={{ color: "rgba(245,240,232,0.50)" }}>
          NDA · Restrictive covenant
        </span>
      </div>

      <p
        className="mb-3 text-[1.05rem] font-bold"
        style={{ fontFamily: "var(--font-display)", color: "var(--brand-on-surface-dark)" }}
      >
        Post-engagement restriction
      </p>

      <p className="mb-5 text-sm leading-relaxed" style={{ color: "rgba(245,240,232,0.65)" }}>
        This clause may restrict work with a broad category of competitors after the relationship
        ends. The impact depends heavily on role, duration, geography, and governing law.
      </p>

      <div
        className="mb-4 rounded-2xl px-4 py-3"
        style={{
          border: "1px solid rgba(245,240,232,0.10)",
          backgroundColor: "rgba(245,240,232,0.04)",
        }}
      >
        <p className="text-xs leading-relaxed" style={{ color: "rgba(245,240,232,0.60)" }}>
          <span className="font-semibold" style={{ color: "rgba(245,240,232,0.80)" }}>
            Why it matters:{" "}
          </span>
          Restrictions that are vague or wider than necessary can limit ordinary future work, not
          just misuse of confidential information.
        </p>
      </div>

      <div
        className="rounded-2xl px-4 py-3"
        style={{
          border: "1px solid rgba(200,121,26,0.25)",
          backgroundColor: "rgba(200,121,26,0.10)",
        }}
      >
        <p className="text-xs leading-relaxed" style={{ color: "var(--brand-accent-light)" }}>
          <span className="font-semibold">Ask for: </span>
          narrower language tied to specific confidential information, a defined time period, and a
          clear territory.
        </p>
      </div>

      <div
        className="mt-6 flex items-center gap-3 border-t pt-4"
        style={{ borderColor: "rgba(245,240,232,0.10)" }}
      >
        <span className="h-1.5 w-10 rounded-full bg-[#c0392b]" aria-hidden />
        <span className="h-1.5 w-7 rounded-full bg-[#b45309]/70" aria-hidden />
        <span
          className="h-1.5 w-5 rounded-full"
          style={{ backgroundColor: "rgba(245,240,232,0.20)" }}
          aria-hidden
        />
        <span
          className="ml-1 text-[10px] font-medium uppercase tracking-[0.18em]"
          style={{ color: "rgba(245,240,232,0.40)" }}
        >
          clause-level review
        </span>
      </div>
    </div>
  );
}
