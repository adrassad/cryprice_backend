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

export async function setPriceToCache(network_id, prices) {
  const key = `prices:${network_id}`;
  const data = await redis.get(key);
  //const prices = data ? JSON.parse(data) : {};
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

export async function getPricesBySymbolCache(networks, symbol) {
  const normalizedSymbol = symbol.toUpperCase();

  const entries = await Promise.all(
    Object.keys(networks).map(async (networkId) => {
      try {
        const raw = await redis.get(`prices:${networkId}`);
        if (!raw) return [];

        const prices = JSON.parse(raw);

        return Object.entries(prices)
          .filter(
            ([, p]) => p?.symbol && p.symbol.toUpperCase() === normalizedSymbol,
          )
          .map(([address, p]) => ({
            networkId,
            address,
            ...p,
          }));
      } catch {
        return [];
      }
    }),
  );
  //console.log("getPricesBySymbol entries", entries);
  return entries.flat();
}
