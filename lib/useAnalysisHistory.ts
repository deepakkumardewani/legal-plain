"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listAnalyses,
  renameAnalysis,
  deleteAnalysis,
  clearAllAnalyses,
  type AnalysisHistoryEntry,
} from "@/lib/analysisHistory";

export interface UseAnalysisHistory {
  entries: AnalysisHistoryEntry[];
  rename: (analysisId: string, name: string) => Promise<void>;
  remove: (analysisId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  reload: () => Promise<void>;
}

export function useAnalysisHistory(): UseAnalysisHistory {
  const [entries, setEntries] = useState<AnalysisHistoryEntry[]>([]);

  const reload = useCallback(async () => {
    const list = await listAnalyses();
    setEntries(list);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    reload().catch(console.error);
  }, [reload]);

  const rename = useCallback(
    async (analysisId: string, name: string) => {
      await renameAnalysis(analysisId, name);
      await reload();
    },
    [reload],
  );

  const remove = useCallback(
    async (analysisId: string) => {
      await deleteAnalysis(analysisId);
      await reload();
    },
    [reload],
  );

  const clearAll = useCallback(async () => {
    await clearAllAnalyses();
    await reload();
  }, [reload]);

  return { entries, rename, remove, clearAll, reload };
}
