"use client";

import { useReducer } from "react";
import { z } from "zod";
import { Copy, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getOrCreateUserId } from "@/lib/userId";
import { MAX_SHARE_PAYLOAD_BYTES } from "@/lib/constants";
import type { AnalysisResult } from "@/lib/types";

interface ShareLinkModalProps {
  analysis: AnalysisResult;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ---------------------------------------------------------------------------
// State machine
// ---------------------------------------------------------------------------

type State =
  | { step: "disclosure"; loading: boolean; error: string | null }
  | { step: "link"; shareUrl: string; error: string | null; copied: boolean };

type Action =
  | { type: "SUBMIT" }
  | { type: "SUCCESS"; shareUrl: string }
  | { type: "ERROR"; error: string }
  | { type: "COPY_SUCCESS" }
  | { type: "COPY_RESET" }
  | { type: "RESET" };

const INITIAL_STATE: State = { step: "disclosure", loading: false, error: null };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SUBMIT":
      return { step: "disclosure", loading: true, error: null };
    case "SUCCESS":
      return { step: "link", shareUrl: action.shareUrl, error: null, copied: false };
    case "ERROR":
      return state.step === "disclosure"
        ? { step: "disclosure", loading: false, error: action.error }
        : { ...state, error: action.error };
    case "COPY_SUCCESS":
      return state.step === "link" ? { ...state, copied: true, error: null } : state;
    case "COPY_RESET":
      return state.step === "link" ? { ...state, copied: false } : state;
    case "RESET":
      return INITIAL_STATE;
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const SharePayloadSchema = z.object({
  analysisResult: z.object({
    analysisId: z.string(),
    documentType: z.string(),
    clauses: z.array(z.unknown()),
    analyzedAt: z.string(),
  }),
  userId: z.string(),
});

function validateSharePayload(analysis: AnalysisResult, userId: string): string | null {
  const payload = { analysisResult: analysis, userId };
  const bytes = new TextEncoder().encode(JSON.stringify(payload)).length;
  if (bytes > MAX_SHARE_PAYLOAD_BYTES) return "Analysis is too large to share.";
  const result = SharePayloadSchema.safeParse(payload);
  if (!result.success) return "Invalid analysis data.";
  return null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ShareLinkModal({ analysis, open, onOpenChange }: ShareLinkModalProps) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const handleAcceptDisclosure = async () => {
    dispatch({ type: "SUBMIT" });
    try {
      const userId = await getOrCreateUserId();
      const validationError = validateSharePayload(analysis, userId);
      if (validationError) {
        dispatch({ type: "ERROR", error: validationError });
        return;
      }

      const res = await fetch("/api/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({ analysisResult: analysis, userId }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Failed to create share link");
      }

      const data = (await res.json()) as { shareId: string };
      const url = `${window.location.origin}/results/${data.shareId}`;
      dispatch({ type: "SUCCESS", shareUrl: url });
    } catch (err) {
      dispatch({
        type: "ERROR",
        error: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  };

  const handleCopy = async () => {
    if (state.step !== "link") return;
    try {
      await navigator.clipboard.writeText(state.shareUrl);
      dispatch({ type: "COPY_SUCCESS" });
      setTimeout(() => dispatch({ type: "COPY_RESET" }), 2000);
    } catch {
      dispatch({
        type: "ERROR",
        error: "Clipboard access blocked — please copy the link above manually.",
      });
    }
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) dispatch({ type: "RESET" });
    onOpenChange(value);
  };

  const isLoading = state.step === "disclosure" && state.loading;
  const error = state.error;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {state.step === "disclosure" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#b45309]" />
                Share this analysis
              </DialogTitle>
              <DialogDescription>
                Before sharing, please read the information below.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg border border-[#e6dccd] bg-[#fef9ee] px-4 py-3 text-sm text-[#0e0f16]">
              <p className="font-semibold text-[#b45309]">⚠ This link expires in 24 hours</p>
              <p className="mt-1 text-[#5c5c66]">
                Anyone with the link can view this analysis. The link will stop working after 24
                hours. No personal information is shared — only the analysis results.
              </p>
            </div>

            {error && (
              <p className="text-sm text-[#c0392b]" role="alert">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAcceptDisclosure}
                disabled={isLoading}
                className="bg-[#0e0f16] text-white hover:bg-[#0e0f16]/90"
              >
                {isLoading ? "Creating link…" : "Generate share link"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Share link ready</DialogTitle>
              <DialogDescription className="sr-only">
                Your share link has been created.
              </DialogDescription>
            </DialogHeader>

            {/* Expiry reminder — kept visible on copy step so users don't miss it */}
            <div className="rounded-lg border border-[#e6dccd] bg-[#fef9ee] px-4 py-3 text-sm">
              <p className="font-semibold text-[#b45309]">⚠ Expires in 24 hours</p>
              <p className="mt-0.5 text-[#5c5c66]">
                Anyone with this link can view the analysis. No personal information is included.
              </p>
            </div>

            {/* URL display */}
            <div className="rounded-lg border border-[#e6dccd] bg-[#f5f0e8] px-3 py-2.5">
              <p className="break-all text-sm font-mono text-[#0e0f16] leading-relaxed">
                {state.shareUrl}
              </p>
            </div>

            {error && (
              <p className="text-sm text-[#c0392b]" role="alert">
                {error}
              </p>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleCopy}
                className={
                  state.copied
                    ? "flex-1 gap-2 bg-[#2d6a4f] text-white hover:bg-[#2d6a4f]/90"
                    : "flex-1 gap-2 bg-[#0e0f16] text-white hover:bg-[#0e0f16]/90"
                }
                aria-label="Copy share link"
              >
                {state.copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy link
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Close
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
