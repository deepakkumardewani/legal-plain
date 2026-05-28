import type { AppRedis } from "@/lib/redis";

const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ANALYZE_LIMIT = 10;
const FOLLOWUP_LIMIT = 10;
const IP_GUARD_LIMIT = 50;
const WINDOW_SECONDS = 24 * 60 * 60;

const SLIDING_WINDOW_SCRIPT = `
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])
local key = KEYS[1]

redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
local count = redis.call('ZCARD', key)

if count < limit then
  redis.call('ZADD', key, now, now .. ':' .. count .. ':' .. math.random())
  redis.call('EXPIRE', key, window)
  return {1, limit - count - 1}
else
  return {0, 0}
end
`;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

async function checkKeyLimit(
  redis: AppRedis,
  key: string,
  limit: number,
  now: number,
): Promise<RateLimitResult> {
  const result = (await redis.eval(SLIDING_WINDOW_SCRIPT, [key], [now, WINDOW_SECONDS, limit])) as [
    number,
    number,
  ];

  return {
    allowed: result[0] === 1,
    remaining: result[1],
  };
}

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function checkRateLimit(
  redis: AppRedis,
  userId: string,
  ip: string,
  type: "analyze" | "followup",
  analysisId?: string,
): Promise<RateLimitResult> {
  if (!UUID_V4_RE.test(userId)) {
    throw new Error("Invalid userId: must be a valid UUID v4");
  }

  const now = Math.floor(Date.now() / 1000);

  const typeKey =
    type === "analyze" ? `rate:analyze:${userId}` : `rate:followup:${analysisId}:${userId}`;

  const typeLimit = type === "analyze" ? ANALYZE_LIMIT : FOLLOWUP_LIMIT;

  const typeResult = await checkKeyLimit(redis, typeKey, typeLimit, now);
  if (!typeResult.allowed) {
    return { allowed: false, remaining: 0 };
  }

  const hashedIP = await hashIP(ip);
  const ipResult = await checkKeyLimit(redis, `rate:ipguard:${hashedIP}`, IP_GUARD_LIMIT, now);
  if (!ipResult.allowed) {
    return { allowed: false, remaining: 0 };
  }

  return {
    allowed: true,
    remaining: Math.min(typeResult.remaining, ipResult.remaining),
  };
}
