"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DisclaimerGate } from "@/components/input/DisclaimerGate";
import { DocumentInput } from "@/components/input/DocumentInput";
import { PdfUpload } from "@/components/input/PdfUpload";
import { JurisdictionSelector } from "@/components/input/JurisdictionSelector";
import { AnalyzeButton } from "@/components/input/AnalyzeButton";
import { LoadingProgress } from "@/components/input/LoadingProgress";
import { getOrCreateUserId } from "@/lib/userId";
import { useAnalysisStore } from "@/lib/useAnalysisStore";
import type { AnalysisResult } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const { setAnalysis } = useAnalysisStore();
  const [documentText, setDocumentText] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getOrCreateUserId().then(setUserId).catch(console.error);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!documentText.trim() || !userId) return;

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
          userJurisdiction: jurisdiction || null,
          userId,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        if (response.status === 429) {
          setError("You've reached the analysis limit for today. Please try again in 24 hours.");
        } else if (response.status === 422) {
          setError(
            body.reason ??
              "This document type is not supported or the content could not be analyzed.",
          );
        } else {
          setError("Something went wrong. Please try again.");
        }
        return;
      }

      const result: AnalysisResult = await response.json();
      setAnalysis(result);
      router.push("/results");
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [documentText, jurisdiction, userId, setAnalysis, router]);

  const disclaimerAcknowledged = true; // DisclaimerGate handles this internally
  const canAnalyze = disclaimerAcknowledged && documentText.trim().length > 0 && userId !== null;

  return (
    <DisclaimerGate>
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">LegalPlain</h1>
          <p className="mt-2 text-gray-500">
            Free, plain-English analysis of your legal documents — no account required
          </p>
        </div>

        <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
          Your document text is sent to Claude (Anthropic) for analysis and is not stored by
          LegalPlain.
        </div>

        <DocumentInput
          value={documentText}
          onChange={setDocumentText}
          uploadTab={
            <PdfUpload
              onText={(text) => {
                setDocumentText(text);
                setError(null);
              }}
            />
          }
        />

        <div className="mt-6">
          <JurisdictionSelector value={jurisdiction} onChange={setJurisdiction} />
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        <div className="mt-6">
          <AnalyzeButton disabled={!canAnalyze} loading={loading} onClick={handleAnalyze} />
        </div>

        <LoadingProgress active={loading} />
      </main>
    </DisclaimerGate>
  );
}
