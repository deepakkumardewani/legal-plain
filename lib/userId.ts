const STORAGE_KEY = "legalplain_uid";
const DB_NAME = "legalplain";
const OBJECT_STORE = "uid_store";
const KEY_NAME = "uid";

const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuidV4(value: string): boolean {
  return UUID_V4_RE.test(value);
}

function generateUuid(): string {
  return crypto.randomUUID();
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readFromLocalStorage(): string | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value && isUuidV4(value) ? value : null;
  } catch {
    return null;
  }
}

function writeToLocalStorage(uuid: string): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, uuid);
    return true;
  } catch {
    return false;
  }
}

function openIndexedDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(OBJECT_STORE)) {
          request.result.createObjectStore(OBJECT_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function readFromIndexedDB(): Promise<string | null> {
  const db = await openIndexedDB();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(OBJECT_STORE, "readonly");
      const store = tx.objectStore(OBJECT_STORE);
      const request = store.get(KEY_NAME);
      request.onsuccess = () => {
        const value = request.result;
        resolve(typeof value === "string" && isUuidV4(value) ? value : null);
      };
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    } finally {
      db.close();
    }
  });
}

async function writeToIndexedDB(uuid: string): Promise<boolean> {
  const db = await openIndexedDB();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(OBJECT_STORE, "readwrite");
      const store = tx.objectStore(OBJECT_STORE);
      store.put(uuid, KEY_NAME);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    } finally {
      db.close();
    }
  });
}

export async function getOrCreateUserId(): Promise<string> {
  if (!isBrowser()) {
    throw new Error("getOrCreateUserId can only be called in a browser environment");
  }

  const fromLocal = readFromLocalStorage();
  if (fromLocal) return fromLocal;

  const fromIndexed = await readFromIndexedDB();
  if (fromIndexed) {
    writeToLocalStorage(fromIndexed);
    return fromIndexed;
  }

  const uuid = generateUuid();
  writeToLocalStorage(uuid);

  writeToIndexedDB(uuid).catch(() => {
    // Best-effort mirror; localStorage works, so user has continuity
  });

  return uuid;
}
