import "server-only";
import { kv as vercelKv } from "@vercel/kv";
import type { AnalysisResult } from "@/lib/types";

const SHARE_TTL_SECONDS = 86400; // 24 hours
const SHARE_PREFIX = "share:";

let _kv: VercelKV | null = null;

interface VercelKV {
  set(key: string, value: unknown, opts?: { ex?: number }): Promise<string | null>;
  get<T>(key: string): Promise<T | null>;
  del(key: string): Promise<number>;
}

export function getKv(): VercelKV {
  if (_kv) return _kv;
  return vercelKv as unknown as VercelKV;
}

export function setKvForTesting(kv: VercelKV): void {
  _kv = kv;
}

export async function saveShare(shareId: string, analysis: AnalysisResult): Promise<void> {
  const kv = getKv();
  await kv.set(`${SHARE_PREFIX}${shareId}`, analysis, { ex: SHARE_TTL_SECONDS });
}

export async function getShare(shareId: string): Promise<AnalysisResult | null> {
  const kv = getKv();
  return kv.get<AnalysisResult>(`${SHARE_PREFIX}${shareId}`);
}

export async function deleteShare(shareId: string): Promise<void> {
  const kv = getKv();
  await kv.del(`${SHARE_PREFIX}${shareId}`);
}
