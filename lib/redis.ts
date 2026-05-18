import "server-only";
import { Redis } from "@upstash/redis";

const REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (_redis) return _redis;

  if (!REST_URL || !REST_TOKEN) {
    throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required");
  }

  _redis = new Redis({
    url: REST_URL,
    token: REST_TOKEN,
  });

  return _redis;
}

export function setRedisForTesting(redis: Redis): void {
  _redis = redis;
}
