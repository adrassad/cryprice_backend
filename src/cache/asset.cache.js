// asset.cache.js
// address -> { address, symbol, decimals }
import { redis } from "../redis/redis.client.js";

const TTL = 60 * 60; // 1 час

function isAddress(value) {
  // простая эвристика под EVM
  return (
    typeof value === "string" && value.startsWith("0x") && value.length === 42
  );
}

export async function getAssetCache(networkId, addressOrSymbol) {
  if (!redis || redis.status === "end") return null;

  if (!addressOrSymbol) return null;

  const value = addressOrSymbol.toLowerCase();

  try {
    // 1️⃣ пробуем как address
    if (isAddress(value)) {
      const raw = await redis.hget(`assets:${networkId}`, value);
      if (raw) return JSON.parse(raw);
    }

    // 2️⃣ fallback: пробуем как symbol
    const rawBySymbol = await redis.hget(`assets:${networkId}:bySymbol`, value);

    return rawBySymbol ? JSON.parse(rawBySymbol) : null;
  } catch (err) {
    console.error("❌ getAssetCache failed:", err.message);
    return null;
  }
}

export async function setAssetsToCache(networkId, assets) {
  if (!redis || redis.status === "end") return null;

  const key = `assets:${networkId}`;

  try {
    const pipeline = redis.pipeline();

    for (const address in assets) {
      const asset = assets[address];

      pipeline.hset(key, address.toLowerCase(), JSON.stringify(asset));

      // optional: поиск по symbol
      pipeline.hset(
        `${key}:bySymbol`,
        asset.symbol.toLowerCase(),
        JSON.stringify(asset),
      );
    }

    pipeline.expire(key, TTL);
    pipeline.expire(`${key}:bySymbol`, TTL);

    await pipeline.exec();

    console.log(
      `✅ Cached ${Object.keys(assets).length} assets for ${networkId}`,
    );
  } catch (err) {
    console.warn("⚠️ Redis setAssetsToCache failed:", err.message);
  }
}

export async function getAssetsByNetworkCache(networkId) {
  if (!redis || redis.status === "end") return null;

  try {
    const key = `assets:${networkId}`;
    const data = await redis.hgetall(key);

    if (!data || Object.keys(data).length === 0) {
      return {};
    }

    const result = {};

    for (const address in data) {
      result[address] = JSON.parse(data[address]);
    }

    return result; // ✅ map: address -> asset
  } catch (err) {
    console.error("❌ getAssetsByNetworkCache failed:", err.message);
    return {};
  }
}

export async function getAssetBySymbolCache(networkId, symbol) {
  if (!redis || redis.status === "end") return null;

  try {
    const raw = await redis.hget(
      `assets:${networkId}:bySymbol`,
      symbol.toLowerCase(),
    );
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
