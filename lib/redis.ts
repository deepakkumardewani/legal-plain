import "server-only";
import { Redis } from "@upstash/redis";
import { Redis as IoRedis } from "ioredis";

/** Shared interface covering only the methods rateLimit.ts actually uses. */
export interface RedisClient {
  eval(script: string, keys: string[], args: unknown[]): Promise<unknown>;
}

function createLocalClient(redisUrl: string): RedisClient {
  const redis = new IoRedis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 2,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
  });

  // Connect eagerly so connection errors surface early.
  void redis.connect().catch((err) => {
    console.error("ioredis connection failed:", (err as Error).message);
  });

  return {
    eval(script: string, keys: string[], args: unknown[]): Promise<unknown> {
      return redis.eval(script, keys.length, ...keys, ...args.map((a) => String(a)));
    },
  };
}

function createUpstashClient(): RedisClient {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required");
  }
  return new Redis({ url, token });
}

let _redis: RedisClient | null = null;

export function getRedis(): RedisClient {
  if (_redis) return _redis;

  if (process.env.NODE_ENV === "development") {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      console.error("REDIS_URL is not set. Local Redis will not be available.");
      throw new Error("REDIS_URL environment variable is required in development");
    }
    _redis = createLocalClient(redisUrl);
  } else {
    _redis = createUpstashClient();
  }

  return _redis;
}

export function setRedisForTesting(redis: RedisClient): void {
  _redis = redis;
}
