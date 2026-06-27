import Link from "next/link";
import { HeroClauseCard } from "@/components/landing/HeroClauseCard";

const HORIZONTAL_SCAN_LINES = ["top-8", "bottom-8", "bottom-20"] as const;
const VERTICAL_SCAN_LINES = ["left-8", "right-8", "right-20"] as const;

export function LandingHero() {
  return (
    <section
      id="hero"
      className="lp-ambient lp-hero-dark relative isolate -mt-[72px] flex min-h-[92vh] items-center overflow-hidden px-5 pb-24 pt-[10.5rem] md:px-8"
    >
      <div className="lp-grid absolute inset-0 opacity-[0.14]" />

      {/* warm corner glow — single accent light source, top-right */}
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-[560px] w-[560px] rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(200,121,26,0.45) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        aria-hidden
      />

      <div
        className="absolute inset-x-0 bottom-0 h-36"
        style={{
          background: "linear-gradient(to top, var(--brand-surface-dark-warm), transparent)",
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[minmax(0,1fr)_430px] lg:gap-20">
        <div>
          <div
            className="lp-rise lp-d1 mb-7 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em]"
            style={{
              fontFamily: "var(--font-display)",
              borderColor: "rgba(200,121,26,0.30)",
              backgroundColor: "rgba(200,121,26,0.10)",
              color: "var(--brand-accent-light)",
            }}
          >
            Free & private review before you sign
          </div>

          <h1
            className="lp-rise lp-d2 max-w-[10ch] tracking-[-0.055em]"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(3.25rem, 7vw + 0.75rem, 6.85rem)",
              lineHeight: 0.91,
              color: "var(--brand-on-surface-dark)",
            }}
          >
            Know what the contract is asking of you.
          </h1>

          <p
            className="lp-rise lp-d3 mt-7 max-w-[59ch] text-[1.08rem] leading-[1.75]"
            style={{ color: "rgba(245,240,232,0.70)" }}
          >
            Upload an employment contract, NDA, or residential lease. LexLight reviews the document
            clause by clause, flags the terms that could cost you, and explains what to ask before
            you sign.
          </p>

          <div className="lp-rise lp-d4 mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold text-white shadow-[0_26px_54px_-28px_rgba(200,121,26,0.95)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              style={{
                fontFamily: "var(--font-display)",
                backgroundColor: "var(--brand-accent)",
              }}
            >
              Analyze my document
              <span aria-hidden>→</span>
            </Link>
            <a
              href="#method"
              className="inline-flex items-center gap-2 rounded-full border px-7 py-3.5 text-base font-medium transition-all duration-200 hover:-translate-y-0.5"
              style={{
                fontFamily: "var(--font-display)",
                borderColor: "rgba(245,240,232,0.20)",
                color: "rgba(245,240,232,0.75)",
              }}
            >
              See the review method
            </a>
          </div>

          <p className="lp-rise lp-d4 mt-6 text-sm" style={{ color: "rgba(245,240,232,0.55)" }}>
            What a lawyer charges $200–$500 to review — free, and ready in minutes.
          </p>
        </div>

        <div className="lp-rise lp-d4 relative hidden lg:block">
          <div
            className="absolute -inset-8 rounded-[2.5rem] border"
            style={{
              borderColor: "rgba(200,121,26,0.10)",
              backgroundColor: "rgba(200,121,26,0.03)",
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{ backgroundColor: "rgba(200,121,26,0.15)" }}
          />
          <div className="relative">
            <div className="pointer-events-none absolute -inset-16 z-0 overflow-hidden rounded-[3rem]">
              {HORIZONTAL_SCAN_LINES.map((position, index) => (
                <span
                  key={position}
                  className={`lp-scan-x absolute left-1/2 ${position} h-px w-[620px] -translate-x-1/2`}
                  style={{
                    background: `linear-gradient(to right, transparent, rgba(239,207,162,0.85), transparent)`,
                    animationDelay: `${index * 0.8}s`,
                  }}
                  aria-hidden
                />
              ))}
              {VERTICAL_SCAN_LINES.map((position, index) => (
                <span
                  key={position}
                  className={`lp-scan-y absolute top-1/2 ${position} h-[520px] w-px -translate-y-1/2`}
                  style={{
                    background: `linear-gradient(to bottom, transparent, rgba(239,207,162,0.65), transparent)`,
                    animationDelay: `${index * 0.65}s`,
                  }}
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
