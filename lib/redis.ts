import "server-only";
import { Redis as UpstashRedis } from "@upstash/redis";
import { Redis as IoRedis } from "ioredis";
import type { AnalysisResult } from "@/lib/types";

/** Single Redis surface for rate limits, analysis cache, and share links. */
export interface AppRedis {
  eval(script: string, keys: string[], args: unknown[]): Promise<unknown>;
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<number>;
}

const SHARE_PREFIX = "share:";
const SHARE_TTL_SECONDS = 86_400;

type MemoryEntry = { value: unknown; expiresAt: number | null };

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function createLocalClient(redisUrl: string): AppRedis {
  _localIoRedis = new IoRedis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 2,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
  });

  const redis = _localIoRedis;

  void redis.connect().catch((err) => {
    console.error("[redis] ioredis connection failed:", (err as Error).message);
  });

  return {
    eval(script, keys, args) {
      return redis.eval(script, keys.length, ...keys, ...args.map(String));
    },
    async get<T>(key: string): Promise<T | null> {
      const raw = await redis.get(key);
      if (raw == null) return null;
      return JSON.parse(raw) as T;
    },
    async set(key, value, ttlSeconds) {
      const payload = JSON.stringify(value);
      if (ttlSeconds) {
        await redis.set(key, payload, "EX", ttlSeconds);
      } else {
        await redis.set(key, payload);
      }
    },
    del(key) {
      return redis.del(key);
    },
  };
}

function createUpstashClient(): AppRedis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required in production",
    );
  }

  const redis = new UpstashRedis({ url, token });

  return {
    eval(script, keys, args) {
      return redis.eval(script, keys, args);
    },
    get<T>(key: string) {
      return redis.get<T>(key);
    },
    async set(key, value, ttlSeconds) {
      if (ttlSeconds) {
        await redis.set(key, value, { ex: ttlSeconds });
      } else {
        await redis.set(key, value);
      }
    },
    del(key) {
      return redis.del(key);
    },
  };
}

function createMemoryClient(): AppRedis {
  const store = new Map<string, MemoryEntry>();

  return {
    async eval(_script, keys, args) {
      const now = Number(args[0]);
      const window = Number(args[1]);
      const limit = Number(args[2]);
      const key = keys[0]!;
      const entry = store.get(key);
      const members: { score: number; member: string }[] = entry
        ? (entry.value as { score: number; member: string }[])
        : [];

      const active = members.filter((m) => m.score > now - window);
      if (active.length < limit) {
        active.push({ score: now, member: `${now}:${active.length}` });
        store.set(key, { value: active, expiresAt: now + window });
        return [1, limit - active.length - 1];
      }
      store.set(key, { value: active, expiresAt: now + window });
      return [0, 0];
    },
    async get<T>(key: string): Promise<T | null> {
      const entry = store.get(key);
      if (!entry) return null;
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        store.delete(key);
        return null;
      }
      return entry.value as T;
    },
    async set(key, value, ttlSeconds) {
      store.set(key, {
        value,
        expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
      });
    },
    async del(key) {
      return store.delete(key) ? 1 : 0;
    },
  };
}

let _redis: AppRedis | null = null;
let _memoryStore: AppRedis | null = null;
let _localIoRedis: IoRedis | null = null;

export function getRedis(): AppRedis {
  if (_redis) return _redis;

  if (isProduction()) {
    _redis = createUpstashClient();
    return _redis;
  }

  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    console.log("[redis] using local Redis at %s", redisUrl);
    _redis = createLocalClient(redisUrl);
    return _redis;
  }

  if (process.env.NODE_ENV === "development") {
    throw new Error("REDIS_URL is required in development (e.g. redis://localhost:6379)");
  }

  console.warn("[redis] REDIS_URL unset — using in-memory store (tests only)");
  _memoryStore ??= createMemoryClient();
  _redis = _memoryStore;
  return _redis;
}

export function setRedisForTesting(redis: AppRedis): void {
  _redis = redis;
}

export function resetRedisForTesting(): void {
  _redis = null;
  _memoryStore = null;
  _localIoRedis = null;
}

/** Dev-only: connect and log on `next dev` startup (see instrumentation.ts). */
export async function warmRedisOnDevStartup(): Promise<void> {
  if (isProduction()) return;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn(
      "[redis] REDIS_URL is not set — add redis://localhost:6379 to .env for local storage",
    );
    return;
  }

  getRedis();
  if (!_localIoRedis) return;

  try {
    if (_localIoRedis.status !== "ready") {
      await _localIoRedis.connect();
    }
    const pong = await _localIoRedis.ping();
    console.log("[redis] connected — ping %s", pong);
  } catch (err) {
    console.error("[redis] connection failed:", (err as Error).message);
  }
}

// --- Share links ---

export async function saveShare(shareId: string, analysis: AnalysisResult): Promise<void> {
  const redis = getRedis();
  await redis.set(`${SHARE_PREFIX}${shareId}`, analysis, SHARE_TTL_SECONDS);
}

export async function getShare(shareId: string): Promise<AnalysisResult | null> {
  const redis = getRedis();
  return redis.get<AnalysisResult>(`${SHARE_PREFIX}${shareId}`);
}

export async function deleteShare(shareId: string): Promise<void> {
  const redis = getRedis();
  await redis.del(`${SHARE_PREFIX}${shareId}`);
}
