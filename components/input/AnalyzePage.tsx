"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnalyzeHeader } from "@/components/input/AnalyzeHeader";
import { AnalyzeSubmitSection } from "@/components/input/AnalyzeSubmitSection";
import { CommonRisksSection } from "@/components/input/CommonRisksSection";
import { DisclaimerGate } from "@/components/input/DisclaimerGate";
import { DocumentTypeSection } from "@/components/input/DocumentTypeSection";
import { DocumentUploadSection } from "@/components/input/DocumentUploadSection";
import { HowItWorksSection } from "@/components/input/HowItWorksSection";
import { KeyTakeawaysSection } from "@/components/input/KeyTakeawaysSection";
import { LegalDisclaimerSection } from "@/components/input/LegalDisclaimerSection";
import { NdaRoleSection } from "@/components/input/NdaRoleSection";
import { TrustStatsSection } from "@/components/input/TrustStatsSection";
import { WhatWeCheckSection } from "@/components/input/WhatWeCheckSection";
import { fontVariables } from "@/lib/fonts";
import { getOrCreateUserId } from "@/lib/userId";
import { useAnalysisStore } from "@/lib/useAnalysisStore";
import { useUnloadGuard } from "@/lib/useUnloadGuard";
import { saveAnalysis } from "@/lib/analysisHistory";
import type { AnalysisResult, DocumentType } from "@/lib/types";

type NdaRole = "RECEIVING" | "DISCLOSING" | "MUTUAL";

export function AnalyzePage() {
  const router = useRouter();
  const { setAnalysis } = useAnalysisStore();
  const [documentText, setDocumentText] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [userRole, setUserRole] = useState<NdaRole>("RECEIVING");
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
          ...(documentType === "NDA" ? { userRole } : {}),
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        if (body.error === "COMMERCIAL_LEASE_DETECTED") {
          setError(
            body.message ??
              "This appears to be a commercial lease. LexLight currently supports residential leases only.",
          );
        } else {
          setError(body.error ?? "Something went wrong. Please try again.");
        }
        return;
      }

      const result: AnalysisResult = await response.json();
      setAnalysis(result, documentText.trim());
      saveAnalysis({
        analysisId: result.analysisId,
        analysis: result,
        documentText: documentText.trim(),
        savedAt: Date.now(),
      }).catch((err) => console.error("[AnalyzePage] saveAnalysis failed", err));
      router.push("/results");
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [documentText, documentType, userId, userRole, setAnalysis, router]);

  useUnloadGuard(loading);

  const canAnalyze = documentText.trim().length > 0 && documentType !== null && userId !== null;

  return (
    <DisclaimerGate>
      <div
        className={`${fontVariables} min-h-screen bg-[#fbf8f1] text-[#18181f]`}
        style={{ fontFamily: "var(--font-body)" }}
      >
        <AnalyzeHeader />
        <main className="mx-auto w-full max-w-3xl px-5 py-6 md:px-8 lg:py-10">
          {/* Form steps — tight group so they read as a unified flow */}
          <div className="space-y-3">
            <DocumentUploadSection
              onText={(text) => {
                setDocumentText(text);
                setError(null);
              }}
            />
            <DocumentTypeSection value={documentType} onChange={setDocumentType} />
            {documentType === "NDA" && <NdaRoleSection value={userRole} onChange={setUserRole} />}
          </div>

          {/* Contextual info — appears once a document type is chosen */}
          {documentType && (
            <div className="mt-5 space-y-3">
              <KeyTakeawaysSection documentType={documentType} />
              <WhatWeCheckSection documentType={documentType} />
              <CommonRisksSection documentType={documentType} />
            </div>
          )}

          {/* How it works — lightest weight, editorial treatment */}
          <div className="mt-6">
            <HowItWorksSection />
          </div>

          {/* Submit — generous separation, it's the goal */}
          <div className="mt-6">
            <AnalyzeSubmitSection
              canAnalyze={canAnalyze}
              loading={loading}
              error={error}
              onAnalyze={handleAnalyze}
            />
          </div>

          {/* Trust footer — supporting reassurance below the goal */}
          <div className="mt-8">
            <TrustStatsSection />
          </div>
          <div className="mt-6">
            <LegalDisclaimerSection />
          </div>
        </main>
      </div>
    </DisclaimerGate>
  );
}
