// In-memory KV mock for testing
const store = new Map<string, { value: unknown; expiresAt: number | null }>();

export const kv = {
  set(key: string, value: unknown, opts?: { ex?: number }): Promise<string | null> {
    const expiresAt = opts?.ex ? Date.now() + opts.ex * 1000 : null;
    store.set(key, { value, expiresAt });
    return Promise.resolve("OK");
  },

  get<T>(key: string): Promise<T | null> {
    const entry = store.get(key);
    if (!entry) return Promise.resolve(null);
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      store.delete(key);
      return Promise.resolve(null);
    }
    return Promise.resolve(entry.value as T);
  },

  del(key: string): Promise<number> {
    const existed = store.has(key);
    store.delete(key);
    return Promise.resolve(existed ? 1 : 0);
  },
};

export function resetKvMock(): void {
  store.clear();
}
