import type { AnalysisResult } from "@/lib/types";

const DB_NAME = "lexlight";
const STORE_NAME = "analysis_history";
const DB_VERSION = 2;
const RETENTION_CAP = 50;
const SNIPPET_LENGTH = 200;

export interface AnalysisHistoryEntry {
  analysisId: string;
  analysis: AnalysisResult;
  documentText: string;
  customName?: string;
  savedAt: number;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof indexedDB !== "undefined";
}

function openDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "analysisId" });
          store.createIndex("savedAt", "savedAt", { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveAnalysis(entry: AnalysisHistoryEntry): Promise<void> {
  if (!isBrowser()) return;
  const db = await openDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(entry);
      tx.oncomplete = async () => {
        db.close();
        await _evictOldest();
        resolve();
      };
      tx.onerror = () => {
        console.error("[analysisHistory] saveAnalysis failed", tx.error);
        db.close();
        resolve();
      };
    } catch (err) {
      console.error("[analysisHistory] saveAnalysis threw", err);
      db.close();
      resolve();
    }
  });
}

async function _evictOldest(): Promise<void> {
  const db = await openDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const index = store.index("savedAt");
      const countReq = store.count();
      countReq.onsuccess = () => {
        const count = countReq.result;
        if (count <= RETENTION_CAP) {
          db.close();
          resolve();
          return;
        }
        const excess = count - RETENTION_CAP;
        const cursorReq = index.openCursor(null, "next");
        let deleted = 0;
        cursorReq.onsuccess = () => {
          const cursor = cursorReq.result;
          if (!cursor || deleted >= excess) {
            db.close();
            resolve();
            return;
          }
          cursor.delete();
          deleted++;
          cursor.continue();
        };
        cursorReq.onerror = () => {
          db.close();
          resolve();
        };
      };
      countReq.onerror = () => {
        db.close();
        resolve();
      };
    } catch {
      db.close();
      resolve();
    }
  });
}

export async function listAnalyses(): Promise<AnalysisHistoryEntry[]> {
  if (!isBrowser()) return [];
  const db = await openDB();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const index = store.index("savedAt");
      const request = index.getAll();
      request.onsuccess = () => {
        db.close();
        const all: AnalysisHistoryEntry[] = request.result ?? [];
        resolve(all.sort((a, b) => b.savedAt - a.savedAt));
      };
      request.onerror = () => {
        db.close();
        resolve([]);
      };
    } catch {
      db.close();
      resolve([]);
    }
  });
}

export async function getAnalysis(analysisId: string): Promise<AnalysisHistoryEntry | null> {
  if (!isBrowser()) return null;
  const db = await openDB();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(analysisId);
      request.onsuccess = () => {
        db.close();
        resolve(request.result ?? null);
      };
      request.onerror = () => {
        db.close();
        resolve(null);
      };
    } catch {
      db.close();
      resolve(null);
    }
  });
}

export async function renameAnalysis(analysisId: string, customName: string): Promise<void> {
  if (!isBrowser()) return;
  const entry = await getAnalysis(analysisId);
  if (!entry) return;

  const updated: AnalysisHistoryEntry = {
    ...entry,
    customName: customName.trim() || undefined,
  };

  const db = await openDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(updated);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        console.error("[analysisHistory] renameAnalysis failed", tx.error);
        db.close();
        resolve();
      };
    } catch (err) {
      console.error("[analysisHistory] renameAnalysis threw", err);
      db.close();
      resolve();
    }
  });
}

export async function deleteAnalysis(analysisId: string): Promise<void> {
  if (!isBrowser()) return;
  const db = await openDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.delete(analysisId);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        console.error("[analysisHistory] deleteAnalysis failed", tx.error);
        db.close();
        resolve();
      };
    } catch (err) {
      console.error("[analysisHistory] deleteAnalysis threw", err);
      db.close();
      resolve();
    }
  });
}

export async function clearAllAnalyses(): Promise<void> {
  if (!isBrowser()) return;
  const db = await openDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        console.error("[analysisHistory] clearAllAnalyses failed", tx.error);
        db.close();
        resolve();
      };
    } catch (err) {
      console.error("[analysisHistory] clearAllAnalyses threw", err);
      db.close();
      resolve();
    }
  });
}

export { RETENTION_CAP, SNIPPET_LENGTH };
