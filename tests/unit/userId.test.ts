import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

type GetOrCreateUserIdFn = () => Promise<string>;

describe("getOrCreateUserId", () => {
  let getOrCreateUserId: GetOrCreateUserIdFn;

  beforeEach(async () => {
    vi.resetModules();
    localStorage.clear();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  async function loadModule() {
    const mod = await import("@/lib/userId");
    getOrCreateUserId = mod.getOrCreateUserId;
  }

  it("returns a valid UUID v4 on first call", async () => {
    await loadModule();
    const uuid = await getOrCreateUserId();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it("returns the same UUID on repeated calls", async () => {
    await loadModule();
    const first = await getOrCreateUserId();
    const second = await getOrCreateUserId();
    const third = await getOrCreateUserId();
    expect(first).toBe(second);
    expect(second).toBe(third);
  });

  it("reads from localStorage on subsequent calls", async () => {
    await loadModule();
    const first = await getOrCreateUserId();
    expect(localStorage.getItem("legalplain_uid")).toBe(first);

    const second = await getOrCreateUserId();
    expect(second).toBe(first);
  });

  it("falls back to indexedDB when localStorage is corrupted", async () => {
    const validUuid = "550e8400-e29b-41d4-a716-446655440000";

    const mockStore = {
      get: vi.fn(() => {
        const req: {
          onsuccess: (() => void) | null;
          onerror: (() => void) | null;
          result: unknown;
        } = {
          onsuccess: null,
          onerror: null,
          result: validUuid,
        };
        setTimeout(() => {
          if (req.onsuccess) req.onsuccess();
        }, 0);
        return req;
      }),
      put: vi.fn(),
    };

    const mockTx = {
      objectStore: vi.fn().mockReturnValue(mockStore),
      oncomplete: null as (() => void) | null,
    };

    const mockDb = {
      transaction: vi.fn().mockReturnValue(mockTx),
      objectStoreNames: {
        contains: vi.fn().mockReturnValue(true),
      },
      close: vi.fn(),
    };

    const openRequest = {
      result: mockDb,
      onsuccess: null as (() => void) | null,
      onerror: null as (() => void) | null,
      onupgradeneeded: null as (() => void) | null,
    };

    vi.stubGlobal("indexedDB", {
      open: vi.fn().mockImplementation(() => {
        setTimeout(() => {
          if (openRequest.onsuccess) openRequest.onsuccess();
        }, 0);
        return openRequest;
      }),
    });

    localStorage.setItem("legalplain_uid", "corrupted-value");

    await loadModule();
    const uuid = await getOrCreateUserId();
    expect(uuid).toBe(validUuid);
  });

  it("regenerates UUID if stored value is malformed", async () => {
    localStorage.setItem("legalplain_uid", "not-a-valid-uuid");

    await loadModule();
    const uuid = await getOrCreateUserId();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(uuid).not.toBe("not-a-valid-uuid");
  });

  it("throws when called server-side", async () => {
    const windowSpy = vi
      .spyOn(globalThis, "window", "get")
      .mockReturnValue(undefined as unknown as Window & typeof globalThis);
    const localStorageSpy = vi
      .spyOn(globalThis, "localStorage", "get")
      .mockReturnValue(undefined as unknown as Storage);

    await loadModule();
    await expect(getOrCreateUserId()).rejects.toThrow(
      "getOrCreateUserId can only be called in a browser environment",
    );

    windowSpy.mockRestore();
    localStorageSpy.mockRestore();
  });

  it("handles localStorage read error gracefully", async () => {
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("QuotaExceeded");
    });

    const mockStore = {
      get: vi.fn(() => {
        const req = {
          onsuccess: null as (() => void) | null,
          onerror: null as (() => void) | null,
          result: undefined,
        };
        setTimeout(() => {
          if (req.onsuccess) req.onsuccess();
        }, 0);
        return req;
      }),
      put: vi.fn(),
    };
    const mockTx = {
      objectStore: vi.fn().mockReturnValue(mockStore),
      oncomplete: null as (() => void) | null,
    };
    const mockDb = {
      transaction: vi.fn().mockReturnValue(mockTx),
      objectStoreNames: { contains: vi.fn().mockReturnValue(true) },
      close: vi.fn(),
    };
    const openRequest = {
      result: mockDb,
      onsuccess: null as (() => void) | null,
      onerror: null as (() => void) | null,
      onupgradeneeded: null as (() => void) | null,
    };
    vi.stubGlobal("indexedDB", {
      open: vi.fn().mockImplementation(() => {
        setTimeout(() => {
          if (openRequest.onsuccess) openRequest.onsuccess();
        }, 0);
        return openRequest;
      }),
    });

    await loadModule();
    const uuid = await getOrCreateUserId();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

    getItemSpy.mockRestore();
  });

  it("handles localStorage write error gracefully", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceeded");
    });

    const mockStore = {
      get: vi.fn(() => {
        const req = {
          onsuccess: null as (() => void) | null,
          onerror: null as (() => void) | null,
          result: undefined,
        };
        setTimeout(() => {
          if (req.onsuccess) req.onsuccess();
        }, 0);
        return req;
      }),
      put: vi.fn(),
    };
    const mockTx = {
      objectStore: vi.fn().mockReturnValue(mockStore),
      oncomplete: null as (() => void) | null,
    };
    const mockDb = {
      transaction: vi.fn().mockReturnValue(mockTx),
      objectStoreNames: { contains: vi.fn().mockReturnValue(true) },
      close: vi.fn(),
    };
    const openRequest = {
      result: mockDb,
      onsuccess: null as (() => void) | null,
      onerror: null as (() => void) | null,
      onupgradeneeded: null as (() => void) | null,
    };
    vi.stubGlobal("indexedDB", {
      open: vi.fn().mockImplementation(() => {
        setTimeout(() => {
          if (openRequest.onsuccess) openRequest.onsuccess();
        }, 0);
        return openRequest;
      }),
    });

    localStorage.clear();
    await loadModule();
    const uuid = await getOrCreateUserId();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it("generates a new UUID when both stores are empty", async () => {
    const mockStore = {
      get: vi.fn(() => {
        const req: {
          onsuccess: (() => void) | null;
          onerror: (() => void) | null;
          result: unknown;
        } = {
          onsuccess: null,
          onerror: null,
          result: undefined,
        };
        setTimeout(() => {
          if (req.onsuccess) req.onsuccess();
        }, 0);
        return req;
      }),
      put: vi.fn(),
    };

    const mockTx = {
      objectStore: vi.fn().mockReturnValue(mockStore),
      oncomplete: null as (() => void) | null,
    };

    const mockDb = {
      transaction: vi.fn().mockReturnValue(mockTx),
      objectStoreNames: {
        contains: vi.fn().mockReturnValue(true),
      },
      close: vi.fn(),
    };

    const openRequest = {
      result: mockDb,
      onsuccess: null as (() => void) | null,
      onerror: null as (() => void) | null,
      onupgradeneeded: null as (() => void) | null,
    };

    vi.stubGlobal("indexedDB", {
      open: vi.fn().mockImplementation(() => {
        setTimeout(() => {
          if (openRequest.onsuccess) openRequest.onsuccess();
        }, 0);
        return openRequest;
      }),
    });

    localStorage.clear();
    await loadModule();
    const uuid = await getOrCreateUserId();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });
});
