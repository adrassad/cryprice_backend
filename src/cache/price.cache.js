//src/cache/price.cache.js
// network_id -> address -> dataPrice
import { redis } from "../redis/redis.client.js";

export async function getPriceCache(network_id, address) {
  const key = `prices:${network_id}`;
  const data = await redis.get(key);
  if (!data) return 0;
  const prices = JSON.parse(data);
  return prices[address.toLowerCase()] ?? 0;
}

export async function setPriceToCache(network_id, address, dataPrice) {
  const key = `prices:${network_id}`;
  const data = await redis.get(key);
  const prices = data ? JSON.parse(data) : {};
  prices[address.toLowerCase()] = dataPrice;
  await redis.set(key, JSON.stringify(prices), "EX", 60 * 60); //1 час TTL
  // console.log(
  //   `✅ Cached ${Object.keys(prices).length} prices for ${network_id}`,
  // );
}

export async function getPricesByNetworkCash(network_id) {
  const key = `prices:${network_id}`;
  const data = await redis.get(key);
  if (!data) return {};
  return JSON.parse(data);
}

export async function getPricesByAddress(address) {
  const normalizedAddress = address.toLowerCase();
  const result = [];

  const keys = await redis.keys("prices:*");
  for (const key of keys) {
    const data = await redis.get(key);
    if (!data) continue;

    const prices = JSON.parse(data);
    if (prices[normalizedAddress]) {
      const networkId = key.split(":")[1];
      result.push({
        networkId,
        address: normalizedAddress,
        dataPrice: prices[normalizedAddress],
      });
    }
  }

  return result;
}
export async function getPricesBySymbol(symbol) {
  const normalizedSymbol = symbol.toUpperCase();
  const result = [];

  const keys = await redis.keys("prices:*");
  for (const key of keys) {
    const data = await redis.get(key);
    if (!data) continue;

    const networkId = key.split(":")[1];
    const prices = JSON.parse(data);

    for (const [address, dataPrice] of Object.entries(prices)) {
      if (dataPrice?.symbol?.toUpperCase() === normalizedSymbol) {
        result.push({
          networkId,
          address,
          ...dataPrice,
        });
      }
    }
  }

  return result;
}
