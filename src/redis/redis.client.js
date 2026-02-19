// src/redis/redis.client.js
import "dotenv/config";
import Redis from "ioredis";

export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  db: Number(process.env.REDIS_DB) || 0,
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  enableOfflineQueue: true,
  keepAlive: 60000,
  retryStrategy(times) {
    return Math.min(times * 600, 2000);
  },
  reconnectOnError(err) {
    return err.message.includes("READONLY");
  },
});

redis.on("connect", () =>
  console.log("🟢 Redis connected", new Date().toISOString()),
);
redis.on("error", (err) => console.error("🔴 Redis error:", err.message));
redis.on("close", () => console.warn("⚠️ Redis connection closed"));
redis.on("reconnecting", () =>
  console.log("🔄 Redis reconnecting...", new Date().toISOString()),
);

export async function connectRedis() {
  console.log("connectRedis:", redis.status);
  if (redis.status === "ready") return;

  try {
    await redis.connect();
    await redis.select(redis.options.db);

    const shouldFlush =
      process.env.FLUSH_REDIS_ON_START === "true" ||
      process.env.FLUSH_REDIS_ON_START === "1";

    if (shouldFlush) {
      const before = await redis.dbsize();
      console.log(
        `🧹 Flushing Redis DB ${redis.options.db} (keys before flush: ${before})`,
      );
      await redis.flushdb();
      const after = await redis.dbsize();
      console.log(`✅ Redis cache cleared (keys after flush: ${after})`);
    }
  } catch (err) {
    console.error("⚠️ Redis connect failed:", err.message);
  }
}
