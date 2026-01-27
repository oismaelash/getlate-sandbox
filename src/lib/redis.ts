import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6380";

let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    // BullMQ requires maxRetriesPerRequest=null for blocking commands (Worker).
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null,
    });
  }
  return redis;
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

