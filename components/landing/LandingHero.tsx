import Link from "next/link";
import { HeroClauseCard } from "@/components/landing/HeroClauseCard";

const HORIZONTAL_SCAN_LINES = ["top-8", "bottom-8", "bottom-20"] as const;
const VERTICAL_SCAN_LINES = ["left-8", "right-8", "right-20"] as const;

export function LandingHero() {
  return (
    <section className="lp-ambient relative isolate flex min-h-[92vh] items-center overflow-hidden bg-[#0f100e] px-5 py-24 md:px-8">
      <div className="lp-grid absolute inset-0 opacity-[0.18]" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#0f100e] to-transparent" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[minmax(0,1fr)_430px] lg:gap-20">
        <div>
          <div
            className="lp-rise lp-d1 mb-7 inline-flex items-center gap-2 rounded-full border border-[#c8791a]/30 bg-[#c8791a]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[#e0a14a]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Free & private review before you sign
          </div>

          <h1
            className="lp-rise lp-d2 max-w-[10ch] text-[#f7efe2] tracking-[-0.055em]"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(3.25rem, 7vw + 0.75rem, 6.85rem)",
              lineHeight: 0.91,
            }}
          >
            Know what the contract is asking of you.
          </h1>

          <p className="lp-rise lp-d3 mt-7 max-w-[59ch] text-[1.08rem] leading-[1.75] text-[#b7ad9d]">
            Upload an employment contract, NDA, or residential lease. LexLight reviews the document
            clause by clause, highlights practical risk, and explains what to ask before you sign.
          </p>

          <div className="lp-rise lp-d4 mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 rounded-full bg-[#c8791a] px-7 py-3.5 text-base font-semibold text-white shadow-[0_26px_54px_-28px_rgba(200,121,26,0.95)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#ad6414] active:translate-y-0"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Analyze my document
              <span aria-hidden>→</span>
            </Link>
            <a
              href="#method"
              className="inline-flex items-center gap-2 rounded-full border border-[#38362e] px-7 py-3.5 text-base font-medium text-[#d8cbb8] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#5a5143] hover:text-[#f7efe2]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              See the review method
            </a>
          </div>
        </div>

        <div className="lp-rise lp-d4 relative hidden lg:block">
          <div className="absolute -inset-8 rounded-[2.5rem] border border-[#c8791a]/10 bg-[#c8791a]/[0.03]" />
          <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c8791a]/20 blur-3xl" />
          <div className="relative">
            <div className="pointer-events-none absolute -inset-16 z-0 overflow-hidden rounded-[3rem]">
              {HORIZONTAL_SCAN_LINES.map((position, index) => (
                <span
                  key={position}
                  className={`lp-scan-x absolute left-1/2 ${position} h-px w-[620px] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#e0a14a]/85 to-transparent`}
                  style={{ animationDelay: `${index * 0.8}s` }}
                  aria-hidden
                />
              ))}
              {VERTICAL_SCAN_LINES.map((position, index) => (
                <span
                  key={position}
                  className={`lp-scan-y absolute top-1/2 ${position} h-[520px] w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-[#e0a14a]/65 to-transparent`}
                  style={{ animationDelay: `${index * 0.65}s` }}
                  aria-hidden
                />
              ))}
            </div>
            <div className="relative z-10">
              <HeroClauseCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
