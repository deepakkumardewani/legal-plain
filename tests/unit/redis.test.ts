import { describe, it, expect, beforeEach, vi } from "vitest";

describe("redis", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("REDIS_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  });

  it("getRedis returns in-memory client when REDIS_URL is unset in test", async () => {
    const { getRedis } = await import("@/lib/redis");
    const redis = getRedis();
    expect(redis).toBeDefined();
    expect(typeof redis.get).toBe("function");
    expect(typeof redis.set).toBe("function");
    expect(typeof redis.del).toBe("function");
    expect(typeof redis.eval).toBe("function");
  });

  it("memory client get returns null for missing key", async () => {
    const { getRedis } = await import("@/lib/redis");
    const redis = getRedis();
    const result = await redis.get("nonexistent");
    expect(result).toBeNull();
  });

  it("memory client set and get round-trip", async () => {
    const { getRedis } = await import("@/lib/redis");
    const redis = getRedis();
    await redis.set("key1", { hello: "world" });
    const result = await redis.get<{ hello: string }>("key1");
    expect(result).toEqual({ hello: "world" });
  });

  it("memory client respects TTL expiry", async () => {
    const { getRedis } = await import("@/lib/redis");
    const redis = getRedis();
    await redis.set("temp", "value", -1); // expired immediately
    const result = await redis.get("temp");
    expect(result).toBeNull();
  });

  it("memory client del removes key", async () => {
    const { getRedis } = await import("@/lib/redis");
    const redis = getRedis();
    await redis.set("to-delete", "data");
    await redis.del("to-delete");
    const result = await redis.get("to-delete");
    expect(result).toBeNull();
  });

  it("memory client del returns 0 for missing key", async () => {
    const { getRedis } = await import("@/lib/redis");
    const redis = getRedis();
    const result = await redis.del("missing");
    expect(result).toBe(0);
  });

  it("memory client eval sliding window — allows when under limit", async () => {
    const { getRedis } = await import("@/lib/redis");
    const redis = getRedis();
    const now = Math.floor(Date.now() / 1000);
    const result = await redis.eval("", ["rate:test"], [now, 60, 5]);
    expect(result).toEqual([1, 3]);
  });

  it("memory client eval sliding window — blocks when over limit", async () => {
    const { getRedis } = await import("@/lib/redis");
    const redis = getRedis();
    const now = Math.floor(Date.now() / 1000);
    // Fire 5 requests
    for (let i = 0; i < 5; i++) {
      await redis.eval("", ["rate:blocked"], [now, 60, 5]);
    }
    // 6th should be blocked
    const result = await redis.eval("", ["rate:blocked"], [now, 60, 5]);
    expect(result).toEqual([0, 0]);
  });

  it("setRedisForTesting overrides the client", async () => {
    const { getRedis, setRedisForTesting, resetRedisForTesting } = await import("@/lib/redis");
    const mockRedis = {
      eval: vi.fn().mockResolvedValue([1, 9]),
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
      del: vi.fn().mockResolvedValue(1),
    };
    setRedisForTesting(mockRedis);
    const redis = getRedis();
    expect(redis).toBe(mockRedis);
    resetRedisForTesting();
  });

  it("saveShare and getShare round-trip via memory client", async () => {
    const { getRedis, saveShare, getShare } = await import("@/lib/redis");
    // Force memory client
    getRedis();
    const analysis = {
      documentType: "NDA" as const,
      analysisId: "test-id",
      analyzedAt: new Date().toISOString(),
    };
    await saveShare("share-1", analysis as Parameters<typeof saveShare>[1]);
    const retrieved = await getShare("share-1");
    expect(retrieved).toBeDefined();
    expect((retrieved as { analysisId: string }).analysisId).toBe("test-id");
  });

  it("deleteShare removes share", async () => {
    const { getRedis, saveShare, getShare, deleteShare } = await import("@/lib/redis");
    getRedis();
    await saveShare("share-del", {
      documentType: "NDA" as const,
      analysisId: "del-id",
      analyzedAt: new Date().toISOString(),
    } as Parameters<typeof saveShare>[1]);
    await deleteShare("share-del");
    const retrieved = await getShare("share-del");
    expect(retrieved).toBeNull();
  });

  it("throws in development when REDIS_URL is absent", async () => {
    vi.resetModules();
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("REDIS_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    const { getRedis } = await import("@/lib/redis");
    expect(() => getRedis()).toThrow("REDIS_URL is required in development");
  });
});
