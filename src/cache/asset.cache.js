// src/cache/asset.cache.js
import { redis } from "../redis/redis.client.js";

const TTL = 60 * 120; // 1 час

function assetsKey(networkId) {
  return `assets:${networkId}`;
}

function assetsBySymbolKey(networkId) {
  return `assets:${networkId}:bySymbol`;
}

function isAddress(value) {
  return (
    typeof value === "string" && value.startsWith("0x") && value.length === 42
  );
}

/**
 * Получить asset по адресу или символу
 */
export async function getAssetCache(networkId, addressOrSymbol) {
  if (!redis || redis.status === "end") return null;
  if (!addressOrSymbol) return null;

  const value = addressOrSymbol.trim().toLowerCase();

  try {
    // 1️⃣ если address
    if (isAddress(value)) {
      const raw = await redis.hget(assetsKey(networkId), value.toLowerCase());

      if (raw) return JSON.parse(raw);
    }

    // 2️⃣ иначе пробуем symbol
    const rawBySymbol = await redis.hget(
      assetsBySymbolKey(networkId),
      value.toUpperCase(),
    );

    return rawBySymbol ? JSON.parse(rawBySymbol) : null;
  } catch (err) {
    console.warn("⚠️ Redis getAssetCache failed:", err.message);
    return null;
  }
}

/**
 * Сохранить assets (address -> asset)
 */
export async function setAssetsToCache(networkId, assets) {
  if (!redis || redis.status === "end") return;

  try {
    const addressEntries = {};
    const symbolEntries = {};

    for (const [address, asset] of Object.entries(assets)) {
      const normalizedAddress = address.toLowerCase();
      const normalizedSymbol = asset?.symbol?.toUpperCase();

      addressEntries[normalizedAddress] = JSON.stringify(asset);

      if (normalizedSymbol) {
        symbolEntries[normalizedSymbol] = JSON.stringify(asset);
      }
    }

    if (Object.keys(addressEntries).length) {
      await redis.hset(assetsKey(networkId), addressEntries);
      await redis.expire(assetsKey(networkId), TTL);
    }

    if (Object.keys(symbolEntries).length) {
      await redis.hset(assetsBySymbolKey(networkId), symbolEntries);
      await redis.expire(assetsBySymbolKey(networkId), TTL);
    }
  } catch (err) {
    console.warn("⚠️ Redis setAssetsToCache failed:", err.message);
  }
}

/**
 * Получить все assets по сети
 */
export async function getAssetsByNetworkCache(networkId) {
  if (!redis || redis.status === "end") return {};

  try {
    const data = await redis.hgetall(assetsKey(networkId));
    if (!data || !Object.keys(data).length) return {};

    return Object.fromEntries(
      Object.entries(data).map(([address, raw]) => [address, JSON.parse(raw)]),
    );
  } catch (err) {
    console.warn("⚠️ Redis getAssetsByNetworkCache failed:", err.message);
    return {};
  }
}

/**
 * Получить asset по symbol
 */
export async function getAssetBySymbolCache(networkId, symbol) {
  if (!redis || redis.status === "end") return null;
  if (!symbol) return null;

  try {
    const raw = await redis.hget(
      assetsBySymbolKey(networkId),
      symbol.toUpperCase(),
    );

    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn("⚠️ Redis getAssetBySymbolCache failed:", err.message);
    return null;
  }
}
