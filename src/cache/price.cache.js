// src/cache/price.cache.js
import { redis } from "../redis/redis.client.js";

const PRICE_TTL = 60 * 60; // 1 час

function priceKey(networkId, address) {
  return `price:${networkId}:${address.toLowerCase()}`;
}

/**
 * Получить цену по сети и адресу
 */
export async function getPriceCache(networkId, address) {
  if (!redis || redis.status === "end") return null;

  try {
    const data = await redis.get(priceKey(networkId, address));
    if (!data) return 0;
    return JSON.parse(data);
  } catch (err) {
    console.warn("⚠️ Redis getPriceCache failed:", err.message);
    return 0;
  }
}

/**
 * Сохранить цены (address -> dataPrice)
 */
export async function setPriceToCache(networkId, prices) {
  if (!redis || redis.status === "end") return null;

  try {
    const pipeline = redis.pipeline();

    for (const [address, price] of Object.entries(prices)) {
      pipeline.set(
        priceKey(networkId, address),
        JSON.stringify(price),
        "EX",
        PRICE_TTL,
      );
    }

    await pipeline.exec();

    console.log(
      `✅ Cached ${Object.keys(prices).length} prices for ${networkId}`,
    );
  } catch (err) {
    console.warn("⚠️ Redis setPriceToCache failed:", err.message);
  }
}

/**
 * Получить все цены по сети
 * ⚠️ Тяжёлая операция — использовать редко (admin / cron)
 */
export async function getPricesByNetworkCache(networkId) {
  if (!redis || redis.status === "end") return null;

  try {
    const result = {};
    const stream = redis.scanStream({
      match: `price:${networkId}:*`,
      count: 100, // batch size
    });

    for await (const keys of stream) {
      if (!keys.length) continue;
      const values = await redis.mget(keys);
      keys.forEach((key, i) => {
        if (values[i]) {
          const address = key.split(":")[2];
          result[address] = JSON.parse(values[i]);
        }
      });
    }

    return result;
  } catch (err) {
    console.warn("⚠️ Redis getPricesByNetworkCache failed:", err.message);
    return {};
  }
}

/**
 * Найти цены по символу (через Redis)
 */
export async function getPricesBySymbolCache(networks, symbol) {
  if (!redis || redis.status === "end") return [];

  const normalizedSymbol = symbol.toUpperCase();
  const results = [];

  for (const networkId of Object.keys(networks)) {
    try {
      const stream = redis.scanStream({
        match: `price:${networkId}:*`,
        count: 100,
      });

      for await (const keys of stream) {
        if (!keys.length) continue;

        const values = await redis.mget(keys);

        keys.forEach((key, i) => {
          if (!values[i]) return;

          try {
            const price = JSON.parse(values[i]);
            if (
              price?.symbol &&
              price.symbol.toUpperCase() === normalizedSymbol
            ) {
              results.push({
                networkId,
                address: key.split(":")[2],
                ...price,
              });
            }
          } catch {
            // Игнорируем некорректные JSON
          }
        });
      }
    } catch (err) {
      console.warn(
        `⚠️ Redis scan failed for network ${networkId}:`,
        err.message,
      );
      continue;
    }
  }

  return results;
}
