import { redis } from "../redis/redis.client.js";

const TTL = 60 * 120; // TTL для всей записи хеша в секундах

function userWalletsKey(userId) {
  return `wallets:${userId}`;
}

// ------------------- Set wallet -------------------
export async function setWalletToCache(userId, wallet) {
  if (!redis || redis.status === "end") return;
  try {
    const key = userWalletsKey(userId);
    await redis.hset(key, wallet.address, JSON.stringify(wallet));
    await redis.expire(key, TTL); // TTL для всего hash
  } catch (err) {
    console.warn("⚠️ Redis setWalletToCache failed:", err.message);
  }
}

// ------------------- Set multiple wallets -------------------
export async function setWalletsToCache(userId, wallets) {
  if (!redis || redis.status === "end") return;

  try {
    if (!wallets || wallets.size === 0) return;
    const key = userWalletsKey(userId);
    const flatData = [];
    for (const [address, wallet] of wallets.entries()) {
      flatData.push(address, JSON.stringify(wallet));
    }
    if (flatData.length === 0) return;
    await redis.hset(key, ...flatData);
    await redis.expire(key, TTL);
  } catch (err) {
    console.warn("⚠️ Redis setWalletsToCache failed:", err.message);
  }
}

// ------------------- Get wallets by user -------------------
export async function getWalletsByUser(userId) {
  console.log("getWalletsByUser redis.status:", userId, redis.status);
  if (!redis || redis.status === "end") return new Map();
  if (redis.status !== "ready") await connectRedis();
  try {
    const key = userWalletsKey(userId);
    const data = await redis.hgetall(key);
    console.log("Redis connection:", {
      host: redis.options?.socket?.host,
      port: redis.options?.socket?.port,
      db: redis.options?.database,
    });
    console.log("Redis URL:", redis.options?.url);
    console.log("getWalletsByUser", data);
    const map = new Map();
    for (const [address, walletJson] of Object.entries(data)) {
      map.set(address, JSON.parse(walletJson));
    }
    return map;
  } catch (err) {
    console.warn("⚠️ Redis getWalletsByUser failed:", err.message);
    return new Map();
  }
}

// ------------------- Get all wallets -------------------
export async function getAllWalletsCache() {
  if (!redis || redis.status === "end") return new Map();
  try {
    const keys = await redis.keys("wallets:*"); // все пользователи
    const result = new Map();

    if (keys.length === 0) return result;

    const pipeline = redis.pipeline();
    keys.forEach((k) => pipeline.hgetall(k));
    const replies = await pipeline.exec();

    for (let i = 0; i < keys.length; i++) {
      const userId = keys[i].split(":")[1];
      const data = replies[i][1]; // [err, value]
      const map = new Map();
      for (const [address, walletJson] of Object.entries(data)) {
        map.set(address, JSON.parse(walletJson));
      }
      result.set(userId, map);
    }
    return result;
  } catch (err) {
    console.warn("⚠️ Redis getAllWallets failed:", err.message);
    return new Map();
  }
}

// ------------------- Delete wallet -------------------
export async function delWalletFromCache(userId, address) {
  if (!redis || redis.status === "end") return;
  try {
    const key = userWalletsKey(userId);
    await redis.hdel(key, address);
  } catch (err) {
    console.warn("⚠️ Redis delWalletFromCache failed:", err.message);
  }
}

// ------------------- Bulk set all wallets -------------------
export async function setAllWalletsToCache(usersWalletsMap) {
  if (!redis || redis.status === "end") return;
  if (!usersWalletsMap || usersWalletsMap.size === 0) return;
  try {
    const pipeline = redis.pipeline();
    for (const [userId, walletsMap] of usersWalletsMap.entries()) {
      const key = userWalletsKey(userId);
      if (!walletsMap || walletsMap.size === 0) continue;
      const flatData = [];
      for (const [address, wallet] of walletsMap.entries()) {
        flatData.push(address, JSON.stringify(wallet));
      }
      pipeline.hset(key, ...flatData);
      pipeline.expire(key, TTL);
    }
    await pipeline.exec();
  } catch (err) {
    console.warn("⚠️ Redis setAllWalletsToCache failed:", err.message);
  }
}
