import Link from "next/link";

export function LandingCtaSection() {
  return (
    <section className="bg-[#c8791a] px-5 py-20 md:px-8 lg:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2
          className="mb-5 text-white tracking-[-0.04em]"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(2.1rem, 4vw + 0.5rem, 4rem)",
            lineHeight: 0.98,
          }}
        >
          Read the agreement before it reads against you.
        </h2>
        <p className="mx-auto mb-8 max-w-[54ch] text-lg leading-relaxed text-white/90">
          Upload a supported PDF and get a structured explanation of the clauses, risks, and
          questions that deserve attention.
        </p>
        <Link
          href="/analyze"
          className="inline-flex items-center gap-2 rounded-full bg-[#fffdf8] px-8 py-4 text-base font-semibold text-[#9d560f] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f4eddf] active:translate-y-0"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Analyze my document →
        </Link>
        <p className="mt-5 text-sm text-white/60">
          No account required · Document not stored · Free, with no usage cap
        </p>
      </div>
    </section>
  );
}
