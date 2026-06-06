export function HeroClauseCard() {
  return (
    <div className="lp-report-card relative w-[360px] select-none rounded-[1.75rem] border border-[#2c2b25] bg-[#131311]/95 p-7 shadow-[0_34px_90px_-42px_rgba(0,0,0,0.9)] xl:w-[430px]">
      <div className="absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-[#e0a14a]/60 to-transparent" />
      <div className="mb-6 flex items-center justify-between">
        <span className="rounded-full border border-[#d1493f]/35 bg-[#d1493f]/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#f06d61]">
          Red flag
        </span>
        <span className="text-xs font-medium text-[#827d70]">NDA · Restrictive covenant</span>
      </div>

      <p
        className="mb-3 text-[1.05rem] font-bold text-[#f2eadc]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Post-engagement restriction
      </p>

      <p className="mb-5 text-sm leading-relaxed text-[#b7ad9d]">
        This clause may restrict work with a broad category of competitors after the relationship
        ends. The impact depends heavily on role, duration, geography, and governing law.
      </p>

      <div className="mb-4 rounded-2xl border border-[#363328] bg-[#1a1915] px-4 py-3">
        <p className="text-xs leading-relaxed text-[#9f9788]">
          <span className="font-semibold text-[#d8cbb8]">Why it matters: </span>
          Restrictions that are vague or wider than necessary can limit ordinary future work, not
          just misuse of confidential information.
        </p>
      </div>

      <div className="rounded-2xl border border-[#c8791a]/25 bg-[#c8791a]/10 px-4 py-3">
        <p className="text-xs leading-relaxed text-[#e0a14a]">
          <span className="font-semibold">Ask for: </span>
          narrower language tied to specific confidential information, a defined time period, and a
          clear territory.
        </p>
      </div>

      <div className="mt-6 flex items-center gap-3 border-t border-[#2c2b25] pt-4">
        <span className="h-1.5 w-10 rounded-full bg-[#d1493f]" aria-hidden />
        <span className="h-1.5 w-7 rounded-full bg-[#d9a524]/70" aria-hidden />
        <span className="h-1.5 w-5 rounded-full bg-[#b8aea0]/35" aria-hidden />
        <span className="ml-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#827d70]">
          clause-level review
        </span>
      </div>
    </div>
  );
}
