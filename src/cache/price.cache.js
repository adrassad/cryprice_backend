// src/cache/price.cache.js
import { redis } from "../redis/redis.client.js";

const PRICE_TTL = 60 * 120; // 1 час

function pricesKey(networkId) {
  return `prices:${networkId}`;
}

function pricesBySymbolKey(networkId) {
  return `prices:${networkId}:bySymbol`;
}

/**
 * Получить цену по сети и адресу
 */
export async function getPriceCache(networkId, address) {
  if (!redis || redis.status === "end") return 0;

  try {
    const raw = await redis.hget(pricesKey(networkId), address.toLowerCase());

    return raw ? JSON.parse(raw) : 0;
  } catch (err) {
    console.warn("⚠️ Redis getPriceCache failed:", err.message);
    return 0;
  }
}

/**
 * Сохранить цены (address -> dataPrice)
 */
export async function setPriceToCache(networkId, prices) {
  if (!redis || redis.status === "end") return;

  try {
    const priceEntries = {};
    const symbolEntries = {};

    for (const [address, price] of Object.entries(prices)) {
      const normalizedAddress = address.toLowerCase();
      const normalizedSymbol = price?.symbol?.toUpperCase();

      priceEntries[normalizedAddress] = JSON.stringify(price);

      if (normalizedSymbol) {
        symbolEntries[normalizedSymbol] = JSON.stringify({
          address: normalizedAddress,
          ...price,
        });
      }
    }

    if (Object.keys(priceEntries).length) {
      await redis.hset(pricesKey(networkId), priceEntries);
      await redis.expire(pricesKey(networkId), PRICE_TTL);
    }

    if (Object.keys(symbolEntries).length) {
      await redis.hset(pricesBySymbolKey(networkId), symbolEntries);
      await redis.expire(pricesBySymbolKey(networkId), PRICE_TTL);
    }

    console.log(
      `✅ Cached ${Object.keys(prices).length} prices for ${networkId}`,
    );
  } catch (err) {
    console.warn("⚠️ Redis setPriceToCache failed:", err.message);
  }
}

/**
 * Получить все цены по сети
 */
export async function getPricesByNetworkCache(networkId) {
  if (!redis || redis.status === "end") return {};

  try {
    const data = await redis.hgetall(pricesKey(networkId));
    if (!data || !Object.keys(data).length) return {};

    return Object.fromEntries(
      Object.entries(data).map(([address, raw]) => [address, JSON.parse(raw)]),
    );
  } catch (err) {
    console.warn("⚠️ Redis getPricesByNetworkCache failed:", err.message);
    return {};
  }
}

/**
 * Найти цену по символу в конкретной сети
 */
export async function getPriceBySymbolCache(networkId, symbol) {
  if (!redis || redis.status === "end") return null;

  try {
    const raw = await redis.hget(
      pricesBySymbolKey(networkId),
      symbol.toUpperCase(),
    );

    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn("⚠️ Redis getPriceBySymbolCache failed:", err.message);
    return null;
  }
}

/**
 * Найти цены по символу во всех сетях
 */
export async function getPricesBySymbolCache(networks, symbol) {
  if (!redis || redis.status === "end") return [];

  const results = [];
  const normalizedSymbol = symbol.toUpperCase();

  for (const networkId of Object.keys(networks)) {
    const price = await getPriceBySymbolCache(networkId, normalizedSymbol);
    if (price) {
      results.push({
        networkId,
        ...price,
      });
    }
  }

  return results;
}
