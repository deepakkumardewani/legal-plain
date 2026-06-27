import "server-only";
import type { NextRequest } from "next/server";
import { getPostHogClient } from "@/lib/posthog";
import type { DocumentType } from "@/lib/types";

export type InputMethod = "pdf-upload" | "paste";

type SizeCategory = "small" | "medium" | "large";

function getDocumentSizeCategory(text: string): SizeCategory {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 1_000) return "small";
  if (wordCount < 10_000) return "medium";
  return "large";
}

function getCountry(request: NextRequest): string {
  return request.headers.get("x-vercel-ip-country") ?? "unknown";
}

// Fire-and-forget wrapper: analytics must never throw into API route handlers.
function capture(fn: () => Promise<void>): void {
  fn().catch((err) => console.error("[analytics] capture failed", err));
}

export function captureDocumentAnalyzed({
  sessionId,
  documentType,
  documentText,
  inputMethod,
  request,
}: {
  sessionId: string;
  documentType: DocumentType;
  documentText: string;
  inputMethod: InputMethod;
  request: NextRequest;
}): void {
  capture(async () => {
    const client = getPostHogClient();
    if (!client) return;

    await client.captureImmediate({
      distinctId: sessionId,
      event: "document_analyzed",
      properties: {
        documentType,
        inputMethod,
        documentSizeCategory: getDocumentSizeCategory(documentText),
        analysisSuccess: true,
        country: getCountry(request),
        $timestamp: new Date().toISOString(),
      },
    });
  });
}

export function captureFollowupAsked({
  sessionId,
  documentType,
  request,
}: {
  sessionId: string;
  documentType: string;
  request: NextRequest;
}): void {
  capture(async () => {
    const client = getPostHogClient();
    if (!client) return;

    await client.captureImmediate({
      distinctId: sessionId,
      event: "followup_asked",
      properties: {
        documentType,
        country: getCountry(request),
        $timestamp: new Date().toISOString(),
      },
    });
  });
}

export function captureShareCreated({
  sessionId,
  documentType,
  request,
}: {
  sessionId: string;
  documentType: string;
  request: NextRequest;
}): void {
  capture(async () => {
    const client = getPostHogClient();
    if (!client) return;

    await client.captureImmediate({
      distinctId: sessionId,
      event: "share_created",
      properties: {
        documentType,
        country: getCountry(request),
        $timestamp: new Date().toISOString(),
      },
    });
  });
}

export async function captureAnalysisStopped({
  sessionId,
  documentType,
  country,
}: {
  sessionId: string;
  documentType: string;
  country: string;
}): Promise<void> {
  const client = getPostHogClient();
  if (!client) return;

  await client.captureImmediate({
    distinctId: sessionId,
    event: "analysis_stopped",
    properties: {
      documentType,
      country,
      $timestamp: new Date().toISOString(),
    },
  });
}
