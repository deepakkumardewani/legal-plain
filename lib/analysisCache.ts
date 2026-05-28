import "server-only";
import { createHash } from "node:crypto";
import { getRedis } from "@/lib/redis";
import type { AnalysisResult, DocumentType } from "@/lib/types";
import type { NDAUserRole } from "@/lib/prompts/pass2-selector";

/** Bump when prompts or scoring change to invalidate stale cache entries. */
export const ANALYSIS_CACHE_VERSION = 2;

const CACHE_PREFIX = `analysis:v${ANALYSIS_CACHE_VERSION}:`;
/** 90 days — same document + type returns the same analysis without re-calling the model. */
export const ANALYSIS_CACHE_TTL_SECONDS = 60 * 60 * 24 * 90;

export function buildAnalysisCacheKey(params: {
  documentText: string;
  documentType: DocumentType;
  userRole?: NDAUserRole;
}): string {
  const normalized = params.documentText.trim().replace(/\s+/g, " ");
  const rolePart = params.userRole ?? "";
  const payload = `${params.documentType}|${rolePart}|${normalized}`;
  const hash = createHash("sha256").update(payload).digest("hex");
  return `${CACHE_PREFIX}${hash}`;
}

export async function getCachedAnalysis(cacheKey: string): Promise<AnalysisResult | null> {
  try {
    return await getRedis().get<AnalysisResult>(cacheKey);
  } catch (error) {
    console.warn("[analysisCache] get failed — skipping cache", {
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function setCachedAnalysis(cacheKey: string, analysis: AnalysisResult): Promise<void> {
  try {
    await getRedis().set(cacheKey, analysis, ANALYSIS_CACHE_TTL_SECONDS);
    console.log(
      "[analysisCache] stored key=%s… ttl=%ds",
      cacheKey.slice(0, 32),
      ANALYSIS_CACHE_TTL_SECONDS,
    );
  } catch (error) {
    console.warn("[analysisCache] set failed — analysis not cached", {
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
