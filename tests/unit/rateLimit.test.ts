import { describe, it, expect, beforeEach, vi } from "vitest";
import type { AppRedis as Redis } from "@/lib/redis";
import type { RateLimitResult } from "@/lib/rateLimit";

type CheckRateLimitFn = (
  redis: Redis,
  userId: string,
  ip: string,
  type: "analyze" | "followup",
  analysisId?: string,
) => Promise<RateLimitResult>;

describe("checkRateLimit", () => {
  let checkRateLimit: CheckRateLimitFn;

  const validUuid = "550e8400-e29b-41d4-a716-446655440000";
  const ip = "192.168.1.1";

  function mockRedisClient(allowed: boolean, remaining: number) {
    return {
      eval: vi.fn().mockResolvedValue([allowed ? 1 : 0, remaining]),
    } as unknown as Redis;
  }

  beforeEach(async () => {
    vi.resetModules();
  });

  async function loadModule() {
    const mod = await import("@/lib/rateLimit");
    checkRateLimit = mod.checkRateLimit;
  }

  it("allows request when under limit", async () => {
    await loadModule();
    const redis = mockRedisClient(true, 9);
    const result = await checkRateLimit(redis, validUuid, ip, "analyze");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it("blocks request when at limit", async () => {
    await loadModule();
    const redis = mockRedisClient(false, 0);
    const result = await checkRateLimit(redis, validUuid, ip, "analyze");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("allows first 10 analyses then blocks 11th", async () => {
    await loadModule();

    for (let i = 0; i < 10; i++) {
      const redis = mockRedisClient(true, 9 - i);
      const result = await checkRateLimit(redis, validUuid, ip, "analyze");
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9 - i);
    }

    const redis = mockRedisClient(false, 0);
    const blocked = await checkRateLimit(redis, validUuid, ip, "analyze");
    expect(blocked.allowed).toBe(false);
  });

  it("uses correct analyze key format", async () => {
    await loadModule();
    const redis = {
      eval: vi.fn().mockResolvedValue([1, 9]),
    } as unknown as Redis;

    await checkRateLimit(redis, validUuid, ip, "analyze");
    const calls = (redis.eval as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls.length).toBe(2);
    const analyzeKey = calls[0][1][0];
    expect(analyzeKey).toBe(`rate:analyze:${validUuid}`);
    const ipKey = calls[1][1][0];
    expect(ipKey).toMatch(/^rate:ipguard:[0-9a-f]{64}$/);
  });

  it("uses correct followup key format", async () => {
    await loadModule();
    const analysisId = "660e8400-e29b-41d4-a716-446655440001";
    const redis = {
      eval: vi.fn().mockResolvedValue([1, 9]),
    } as unknown as Redis;

    await checkRateLimit(redis, validUuid, ip, "followup", analysisId);
    const calls = (redis.eval as ReturnType<typeof vi.fn>).mock.calls;
    const followupKey = calls[0][1][0];
    expect(followupKey).toBe(`rate:followup:${analysisId}:${validUuid}`);
  });

  it("throws on invalid userId", async () => {
    await loadModule();
    const redis = mockRedisClient(true, 9);
    await expect(checkRateLimit(redis, "not-a-uuid", ip, "analyze")).rejects.toThrow(
      "Invalid userId: must be a valid UUID v4",
    );
  });

  it("blocks when IP guard exceeds limit", async () => {
    await loadModule();

    let callCount = 0;
    const redis = {
      eval: vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve([1, 9]);
        }
        return Promise.resolve([0, 0]);
      }),
    } as unknown as Redis;

    const result = await checkRateLimit(redis, validUuid, ip, "analyze");
    expect(result.allowed).toBe(false);
  });

  it("hashes IP consistently", async () => {
    await loadModule();
    const redis = {
      eval: vi.fn().mockResolvedValue([1, 9]),
    } as unknown as Redis;

    await checkRateLimit(redis, validUuid, "10.0.0.1", "analyze");
    const calls = (redis.eval as ReturnType<typeof vi.fn>).mock.calls;

    await checkRateLimit(redis, validUuid, "10.0.0.1", "analyze");
    const calls2 = (redis.eval as ReturnType<typeof vi.fn>).mock.calls;

    const firstHashKey = calls[1][1][0];
    const secondHashKey = calls2[3][1][0];
    expect(firstHashKey).toBe(secondHashKey);
  });

  it("returns remaining as min of type and IP guard", async () => {
    await loadModule();

    let callCount = 0;
    const redis = {
      eval: vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve([1, 9]);
        }
        return Promise.resolve([1, 49]);
      }),
    } as unknown as Redis;

    const result = await checkRateLimit(redis, validUuid, ip, "analyze");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it("blocks on type limit even when IP guard is fine", async () => {
    await loadModule();

    let callCount = 0;
    const redis = {
      eval: vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve([0, 0]);
        }
        return Promise.resolve([1, 49]);
      }),
    } as unknown as Redis;

    const result = await checkRateLimit(redis, validUuid, ip, "analyze");
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });
});
