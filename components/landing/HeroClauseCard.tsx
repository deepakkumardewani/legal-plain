export function HeroClauseCard() {
  return (
    <div className="w-[360px] xl:w-[420px] rounded-2xl bg-[#14151f] border border-[#2a2b3a] p-7 shadow-2xl rotate-1 select-none">
      <div className="flex items-center justify-between mb-5">
        <span className="rounded-full bg-red-500/15 border border-red-500/25 px-3 py-1 text-xs font-semibold text-red-400">
          🔴 Red Flag
        </span>
        <span className="text-xs text-[#5a5a72] font-medium">NDA · Section 8</span>
      </div>

      <h4
        className="text-[#f0ebe2] text-base font-bold mb-3"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Non-Compete Clause
      </h4>

      <p className="text-sm text-[#9d9db8] leading-relaxed mb-4">
        You can&apos;t work for any competitor in your industry for{" "}
        <strong className="text-[#c8c8dc]">24 months</strong> after leaving — even if you&apos;re
        fired or laid off.
      </p>

      <div className="rounded-lg bg-[#1e1f2e] px-4 py-3 mb-4">
        <p className="text-xs text-[#8888a0] leading-relaxed">
          <span className="font-semibold text-[#9d9db8]">Why this matters: </span>
          Broader than standard. Most NDAs limit non-compete to 6–12 months and your specific role —
          not your entire industry.
        </p>
      </div>

      <div className="rounded-lg bg-[#c8791a]/10 border border-[#c8791a]/20 px-4 py-3">
        <p className="text-xs leading-relaxed text-[#d4921f]">
          <span className="font-semibold">💬 Ask for: </span>
          &ldquo;Limit to 12 months and my specific product area only, not the whole
          industry.&rdquo;
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-[#2a2b3a] flex items-center gap-3">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500/60" aria-hidden />
        <span className="h-1.5 w-1.5 rounded-full bg-yellow-500/40" aria-hidden />
        <span className="h-1.5 w-1.5 rounded-full bg-gray-500/30" aria-hidden />
        <span className="h-1.5 w-1.5 rounded-full bg-green-500/30" aria-hidden />
        <span className="text-[10px] text-[#5a5a72] ml-1">14 clauses analyzed</span>
      </div>
    </div>
  );
}
