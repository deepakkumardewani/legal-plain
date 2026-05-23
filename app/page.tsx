import Link from "next/link";
import { FaqAccordion } from "@/components/landing/FaqAccordion";
import { HeroClauseCard } from "@/components/landing/HeroClauseCard";
import { fontVariables } from "@/lib/fonts";

const DOC_TYPES = [
  {
    name: "Employment Contract",
    emoji: "💼",
    description: "Job offers and employment agreements",
    clauses: [
      "Compensation & benefits",
      "Non-compete scope & geography",
      "IP assignment & personal carve-out",
      "Severance terms",
      "Arbitration & class action waiver",
      "At-will vs for-cause termination",
      "Probation period & outside work",
    ],
  },
  {
    name: "NDA",
    emoji: "🔒",
    description: "Non-disclosure and confidentiality agreements",
    clauses: [
      "Definition of confidential information",
      "Permitted disclosures & exclusions",
      "Term & survival period",
      "Return or destruction of materials",
      "Remedies & injunctive relief",
      "Residuals clause",
      "Mutual vs one-sided protection",
    ],
  },
  {
    name: "Residential Lease",
    emoji: "🏠",
    description: "Apartment and rental agreements",
    clauses: [
      "Rent amount & due dates",
      "Security deposit terms",
      "Early termination rights",
      "Auto-renewal provisions",
      "Maintenance responsibilities",
      "Subletting & guest policies",
      "Entry notice requirements",
    ],
  },
] as const;

const FEATURES = [
  {
    num: "01",
    title: "Color-coded risk levels",
    desc: "🔴 Red Flag, 🟡 Unusual, ⚪ Context-Dependent, 🟢 Standard — every clause categorized so you know exactly where to focus your attention.",
  },
  {
    num: "02",
    title: "Jurisdiction-aware analysis",
    desc: "Enter your state and every clause interpretation adjusts. Automatically detects when the governing law conflicts with your actual location.",
  },
  {
    num: "03",
    title: "Missing clause detection",
    desc: "Checks for clauses that should exist but don't — absent severance terms, missing IP carve-outs, no early termination rights.",
  },
  {
    num: "04",
    title: "Negotiation language",
    desc: "Every red flag comes with the exact words to use in your counteroffer. Not vague advice — copy-paste ready language for each issue.",
  },
  {
    num: "05",
    title: "Key dates & deadlines",
    desc: "Probation periods, notice requirements, auto-renewal dates — all extracted and surfaced so nothing slips past unnoticed.",
  },
  {
    num: "06",
    title: "Export your analysis",
    desc: "Save as PDF, Markdown, or a 24-hour share link. Send it to your lawyer for a focused review of exactly what matters.",
  },
] as const;

const FAQ_ITEMS = [
  {
    q: "Is LegalPlain really free?",
    a: "Yes — no account, no credit card, no trial period. You get 10 analyses per day and 3 follow-up questions per analysis.",
  },
  {
    q: "How accurate is the analysis?",
    a: "LegalPlain uses Claude (Anthropic) with tailored prompts for each document type. For high-stakes decisions, use this as a focused starting point — then consult a licensed attorney.",
  },
  {
    q: "What data do you store?",
    a: "Your document text is never stored. If you create a share link, only the analysis results (not your document) are stored for 24 hours, then automatically and permanently deleted.",
  },
  {
    q: "Which documents are supported?",
    a: "Employment contracts, NDAs, and residential leases — the three contracts most commonly signed without a lawyer. Additional document types are coming in v2.",
  },
  {
    q: "Is this legal advice?",
    a: "No. LegalPlain provides educational information only. No attorney-client relationship is formed. For decisions with significant legal consequences, consult a licensed attorney in your jurisdiction.",
  },
] as const;

const TRUST_ITEMS = [
  "Free forever",
  "No account required",
  "Document text never stored",
  "Under 35 seconds",
  "10 analyses/day",
];

export default function LandingPage() {
  return (
    <div
      className={`${fontVariables} bg-[#faf9f6] text-[#18181f]`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      <style>{`
        @keyframes lp-fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lp-animate { animation: lp-fade-in-up 0.65s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .lp-d1 { animation-delay: 0.05s; }
        .lp-d2 { animation-delay: 0.15s; }
        .lp-d3 { animation-delay: 0.25s; }
        .lp-d4 { animation-delay: 0.38s; }
        .lp-d5 { animation-delay: 0.52s; }
      `}</style>

      {/* ── NAV ───────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-[#0e0f16]/92 border-b border-[#1e2030]">
        <span
          className="text-[#f0ebe2] text-lg font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          LegalPlain
        </span>
        <Link
          href="/analyze"
          className="rounded-full bg-[#c8791a] px-5 py-2 text-sm font-semibold text-white hover:bg-[#b36815] transition-colors"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Analyze a document →
        </Link>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="bg-[#0e0f16] min-h-[90vh] flex items-center px-6 py-24">
        <div className="mx-auto max-w-6xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-20 items-center">
            {/* Copy */}
            <div>
              <div
                className="lp-animate lp-d1 mb-6 inline-flex items-center gap-2 rounded-full border border-[#c8791a]/30 bg-[#c8791a]/10 px-4 py-1.5 text-xs font-semibold text-[#d4921f] tracking-wide uppercase"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Free · No account required
              </div>

              <h1
                className="lp-animate lp-d2 text-[#f0ebe2] leading-[1.04] tracking-tight mb-6"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "clamp(2.75rem, 5vw + 1rem, 5.25rem)",
                }}
              >
                Read your contract
                <br />
                <span className="text-[#c8791a]">like a lawyer.</span>
              </h1>

              <p className="lp-animate lp-d3 text-[#9d9db8] text-lg leading-relaxed max-w-[52ch] mb-10">
                Free AI analysis of employment contracts, NDAs, and leases. Clause-by-clause risk
                scoring, plain English, jurisdiction-aware. Under 35 seconds. No account.
              </p>

              <div className="lp-animate lp-d4 flex flex-wrap gap-4">
                <Link
                  href="/analyze"
                  className="inline-flex items-center gap-2 rounded-full bg-[#c8791a] px-7 py-3.5 text-base font-semibold text-white hover:bg-[#b36815] hover:translate-x-0.5 transition-all"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Analyze my contract
                  <span aria-hidden>→</span>
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-full border border-[#2a2b3a] px-7 py-3.5 text-base font-medium text-[#b0b0c8] hover:border-[#3a3b4e] hover:text-[#d0d0e0] transition-colors"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  How it works
                </a>
              </div>
            </div>

            {/* Mock clause card */}
            <div className="lp-animate lp-d5 hidden lg:block">
              <HeroClauseCard />
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ───────────────────────────────────────────── */}
      <div className="bg-[#f5f0e8] border-y border-[#e4dfd6]">
        <div className="mx-auto max-w-6xl px-6 py-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-2">
          {TRUST_ITEMS.map((item) => (
            <span key={item} className="text-sm font-medium text-[#72728a] flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c8791a] shrink-0" aria-hidden />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-[#faf9f6] px-6 py-24 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16">
            <p
              className="text-xs font-semibold uppercase tracking-widest text-[#c8791a] mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              How it works
            </p>
            <h2
              className="text-[#18181f] leading-tight"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(1.875rem, 3vw + 0.5rem, 2.875rem)",
              }}
            >
              From upload to insight
              <br />
              in three steps.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
            {[
              {
                num: "01",
                title: "Paste text or upload a PDF",
                body: "Drop in your employment offer, NDA, or lease agreement. PDF or plain text — both work. Up to 150,000 characters.",
              },
              {
                num: "02",
                title: "AI reads every clause together",
                body: "Unlike tools that check clauses in isolation, LegalPlain analyzes the full document as a system — because legal risk compounds across clauses.",
              },
              {
                num: "03",
                title: "Get your full risk report",
                body: "Color-coded risks, plain-English explanations, negotiation tips, and missing clause alerts — ready in under 35 seconds.",
              },
            ].map((step) => (
              <div key={step.num}>
                <span
                  className="block text-6xl font-black text-[#e4dfd6] mb-4 leading-none tabular-nums"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {step.num}
                </span>
                <h3
                  className="text-xl font-bold text-[#18181f] mb-3"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {step.title}
                </h3>
                <p className="text-[#72728a] leading-relaxed text-[0.9375rem]">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUPPORTED DOC TYPES ───────────────────────────────────── */}
      <section className="bg-white px-6 py-24 lg:py-32 border-t border-[#e4dfd6]">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16">
            <p
              className="text-xs font-semibold uppercase tracking-widest text-[#c8791a] mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Supported documents
            </p>
            <h2
              className="text-[#18181f] leading-tight"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(1.875rem, 3vw + 0.5rem, 2.875rem)",
              }}
            >
              Three documents.
              <br />
              Tailored analysis for each.
            </h2>
            <p className="mt-4 text-[#72728a] max-w-[60ch] text-[1.0625rem] leading-relaxed">
              Generic AI produces generic output. LegalPlain uses document-specific prompts built
              around the exact clauses that matter — because an employment contract is nothing like
              a lease.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DOC_TYPES.map((doc) => (
              <div
                key={doc.name}
                className="rounded-2xl border border-[#e4dfd6] bg-[#faf9f6] p-8 hover:border-[#c8791a]/40 hover:bg-white transition-all duration-200 group"
              >
                <span className="block text-3xl mb-5" aria-hidden>
                  {doc.emoji}
                </span>
                <h3
                  className="text-xl font-bold text-[#18181f] mb-1.5"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {doc.name}
                </h3>
                <p className="text-sm text-[#72728a] mb-5">{doc.description}</p>

                <ul className="space-y-2">
                  {doc.clauses.map((clause) => (
                    <li key={clause} className="flex items-start gap-2.5 text-sm text-[#4a4a5e]">
                      <span
                        className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#c8791a]"
                        aria-hidden
                      />
                      {clause}
                    </li>
                  ))}
                </ul>

                <div className="mt-7 pt-5 border-t border-[#e4dfd6] flex flex-wrap gap-1.5">
                  {["🔴 Red flags", "🟡 Unusual", "⚪ Context", "🟢 Standard"].map((lvl) => (
                    <span
                      key={lvl}
                      className="text-xs text-[#72728a] bg-white border border-[#e4dfd6] rounded-full px-2.5 py-0.5 group-hover:border-[#d4d0c8] transition-colors"
                    >
                      {lvl}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE HIGHLIGHTS ────────────────────────────────────── */}
      <section className="bg-[#faf9f6] px-6 py-24 lg:py-32 border-t border-[#e4dfd6]">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16">
            <p
              className="text-xs font-semibold uppercase tracking-widest text-[#c8791a] mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              What you get
            </p>
            <h2
              className="text-[#18181f] leading-tight"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(1.875rem, 3vw + 0.5rem, 2.875rem)",
              }}
            >
              Everything you need to
              <br />
              understand the contract.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {FEATURES.map((feature) => (
              <div key={feature.num}>
                <p
                  className="text-sm font-bold text-[#c8791a] mb-3 tabular-nums"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {feature.num}
                </p>
                <h3
                  className="text-lg font-bold text-[#18181f] mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#72728a]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIVACY ───────────────────────────────────────────────── */}
      <section className="bg-[#0e0f16] px-6 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 items-start">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest text-[#c8791a] mb-4"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Your privacy
              </p>
              <h2
                className="text-[#f0ebe2] leading-tight"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "clamp(1.75rem, 2.5vw + 0.5rem, 2.5rem)",
                }}
              >
                Your document
                <br />
                stays yours.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  title: "Never stored",
                  body: "Your document text is sent to Claude (Anthropic) for analysis and is not stored by LegalPlain — not on our servers, not in any database.",
                },
                {
                  title: "Zero account",
                  body: "No signup, no login, no email address, no tracking cookies. You are completely anonymous. The only identifier is a disposable UUID in your browser.",
                },
                {
                  title: "Share on your terms",
                  body: "Analysis results are only stored if you choose to create a share link. It expires after 24 hours and is then permanently deleted.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-[#2a2b3a] bg-[#14151f] p-6"
                >
                  <h3
                    className="text-[#f0ebe2] font-semibold mb-2"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#8888a0] leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="bg-white px-6 py-24 lg:py-32 border-t border-[#e4dfd6]">
        <div className="mx-auto max-w-3xl">
          <div className="mb-14">
            <p
              className="text-xs font-semibold uppercase tracking-widest text-[#c8791a] mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              FAQ
            </p>
            <h2
              className="text-[#18181f] leading-tight"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(1.875rem, 3vw + 0.5rem, 2.875rem)",
              }}
            >
              Common questions
            </h2>
          </div>

          <FaqAccordion items={[...FAQ_ITEMS]} />
        </div>
      </section>

      {/* ── BOTTOM CTA ────────────────────────────────────────────── */}
      <section className="bg-[#c8791a] px-6 py-16 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            className="text-white mb-4 leading-tight"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(1.75rem, 3vw + 0.5rem, 2.75rem)",
            }}
          >
            Don&apos;t sign until you understand
            <br />
            what you&apos;re signing.
          </h2>
          <p className="text-white/75 mb-8 text-lg">
            Free analysis in under 35 seconds. No account required.
          </p>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-[#c8791a] hover:bg-[#f5f0e8] transition-colors"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Analyze my contract →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer className="bg-[#0e0f16] px-6 py-12 border-t border-[#1e2030]">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <span
              className="text-[#f0ebe2] text-lg font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              LegalPlain
            </span>
          </div>
          <p className="text-sm text-[#5a5a72] leading-relaxed max-w-[70ch] mb-6">
            LegalPlain provides general educational information only — not legal advice. No
            attorney-client relationship is formed by using this tool. The analysis may contain
            errors and does not account for all applicable laws. Do not rely on this analysis alone
            to make legal decisions. For matters of significant consequence, consult a licensed
            attorney in your jurisdiction.
          </p>
          <p className="text-xs text-[#3a3a52]">
            © {new Date().getFullYear()} LegalPlain. Free, forever.
          </p>
        </div>
      </footer>
    </div>
  );
}
