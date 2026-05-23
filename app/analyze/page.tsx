"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DisclaimerGate } from "@/components/input/DisclaimerGate";
import { PdfUpload } from "@/components/input/PdfUpload";
import { AnalyzeButton } from "@/components/input/AnalyzeButton";
import { LoadingProgress } from "@/components/input/LoadingProgress";
import { fontVariables } from "@/lib/fonts";
import { getOrCreateUserId } from "@/lib/userId";
import { useAnalysisStore } from "@/lib/useAnalysisStore";
import type { AnalysisResult, DocumentType } from "@/lib/types";

const DOCUMENT_TYPES: { value: DocumentType; label: string; emoji: string; hint: string }[] = [
  {
    value: "EMPLOYMENT_CONTRACT",
    label: "Employment Contract",
    emoji: "💼",
    hint: "Job offers & employment agreements",
  },
  { value: "NDA", label: "NDA", emoji: "🔒", hint: "Non-disclosure & confidentiality agreements" },
  {
    value: "RESIDENTIAL_LEASE",
    label: "Residential Lease",
    emoji: "🏠",
    hint: "Apartment & rental agreements",
  },
];

export default function AnalyzePage() {
  const router = useRouter();
  const { setAnalysis } = useAnalysisStore();
  const [documentText, setDocumentText] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getOrCreateUserId().then(setUserId).catch(console.error);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!documentText.trim() || !documentType || !userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({
          documentText: documentText.trim(),
          documentType,
          userId,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        if (response.status === 429) {
          setError("You've reached the analysis limit for today. Please try again in 24 hours.");
        } else {
          setError(body.error ?? "Something went wrong. Please try again.");
        }
        return;
      }

      const result: AnalysisResult = await response.json();
      setAnalysis(result, documentText.trim());
      router.push("/results");
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [documentText, documentType, userId, setAnalysis, router]);

  const canAnalyze = documentText.trim().length > 0 && documentType !== null && userId !== null;

  return (
    <DisclaimerGate>
      <div
        className={`${fontVariables} min-h-screen bg-[#faf9f6] text-[#18181f]`}
        style={{ fontFamily: "var(--font-body)" }}
      >
        <style>{`
          @keyframes ap-rise {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .ap-rise { animation: ap-rise 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
          .ap-d1 { animation-delay: 0.04s; }
          .ap-d2 { animation-delay: 0.12s; }
          .ap-d3 { animation-delay: 0.22s; }
          .ap-d4 { animation-delay: 0.32s; }
          @media (prefers-reduced-motion: reduce) {
            .ap-rise { animation: none; }
          }
        `}</style>

        <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-[#1e2030] bg-[#0e0f16]/92 px-6 py-4 backdrop-blur-md">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-[#f0ebe2]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            LegalPlain
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-[#9d9db8] transition-colors hover:text-[#f0ebe2]"
          >
            ← Back to home
          </Link>
        </nav>

        <main className="mx-auto w-full max-w-2xl px-6 py-16 lg:py-20">
          <header className="ap-rise ap-d1">
            <p
              className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#c8791a]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Free · No account required
            </p>
            <h1
              className="leading-[1.08] tracking-tight text-[#18181f]"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "clamp(2.25rem, 4vw + 1rem, 3.25rem)",
              }}
            >
              Upload your contract.
            </h1>
            <p className="mt-4 max-w-[52ch] text-[1.0625rem] leading-relaxed text-[#72728a]">
              Drop an employment contract, NDA, or residential lease. You&apos;ll get a
              clause-by-clause risk report in plain English — in under 35 seconds.
            </p>
          </header>

          <div className="mt-12 space-y-10">
            <section className="ap-rise ap-d2">
              <StepHeading
                num="01"
                title="Add your document"
                hint="PDF only · employment contract, NDA, or lease"
              />
              <div className="mt-4">
                <PdfUpload
                  onText={(text) => {
                    setDocumentText(text);
                    setError(null);
                  }}
                />
              </div>
            </section>

            <section className="ap-rise ap-d3">
              <StepHeading
                num="02"
                title="Select document type"
                hint="Enables tailored clause analysis for your contract"
              />
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {DOCUMENT_TYPES.map((dt) => (
                  <button
                    key={dt.value}
                    type="button"
                    onClick={() => setDocumentType(dt.value)}
                    className={`flex flex-col items-start rounded-xl border px-4 py-4 text-left transition-all ${
                      documentType === dt.value
                        ? "border-[#c8791a] bg-[#fff8f0] ring-2 ring-[#c8791a]/20"
                        : "border-[#d8d2c6] bg-white hover:border-[#c8791a]/50"
                    }`}
                  >
                    <span className="mb-2 text-2xl" aria-hidden>
                      {dt.emoji}
                    </span>
                    <span className="text-sm font-semibold text-[#18181f]">{dt.label}</span>
                    <span className="mt-0.5 text-xs text-[#72728a]">{dt.hint}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {error && (
            <p
              className="mt-8 rounded-xl bg-[#fbeceb] px-4 py-3 text-sm font-medium text-[#b3261e]"
              role="alert"
            >
              {error}
            </p>
          )}

          <div className="ap-rise ap-d4 mt-10">
            <AnalyzeButton disabled={!canAnalyze} loading={loading} onClick={handleAnalyze} />
            <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-[#a3a0a8]">
              <svg
                className="h-3.5 w-3.5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 0h10.5a2.25 2.25 0 0 1 2.25 2.25v6a2.25 2.25 0 0 1-2.25 2.25H6.75a2.25 2.25 0 0 1-2.25-2.25v-6a2.25 2.25 0 0 1 2.25-2.25Z"
                />
              </svg>
              Sent to Claude (Anthropic) for analysis. Your document is never stored by LegalPlain.
            </p>
          </div>

          <LoadingProgress active={loading} />
        </main>
      </div>
    </DisclaimerGate>
  );
}

interface StepHeadingProps {
  num: string;
  title: string;
  hint: string;
}

function StepHeading({ num, title, hint }: StepHeadingProps) {
  return (
    <div className="flex items-baseline gap-3">
      <span
        className="text-sm font-bold tabular-nums text-[#c8791a]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {num}
      </span>
      <div>
        <h2
          className="text-lg font-bold text-[#18181f]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h2>
        <p className="mt-0.5 text-sm text-[#72728a]">{hint}</p>
      </div>
    </div>
  );
}
