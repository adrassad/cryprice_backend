// src/redis/redis.client.js
import Redis from "ioredis";

export const redis = new Redis({
  host: process.env.REDIS_HOST ?? "127.0.0.1",
  port: process.env.REDIS_PORT ?? 6379,
  lazyConnect: true, // 🔥 важно
  maxRetriesPerRequest: 3, // не блокировать event loop
  enableOfflineQueue: true,
  keepAlive: 30000,
  retryStrategy(times) {
    return Math.min(times * 100, 2000);
  },
  reconnectOnError(err) {
    const targetError = "READONLY";
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
});

// Подписка на события
redis.on("connect", () => {
  console.log("🟢 Redis connected", new Date().toISOString());
});

redis.on("error", (err) => {
  console.error("🔴 Redis error:", err.message);
});

redis.on("close", () => {
  console.warn("⚠️ Redis connection closed");
});

redis.on("reconnecting", () => {
  console.log("🔄 Redis reconnecting...", new Date().toISOString());
});

// Функция для подключения Redis при старте приложения
export async function connectRedis() {
  try {
    await redis.connect(); // 🔑 lazyConnect требует явного вызова
  } catch (err) {
    console.error("⚠️ Redis connect failed:", err.message);
  }
}
