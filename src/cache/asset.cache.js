// asset.cache.js
// address -> { address, symbol, decimals }
import { redis } from "../redis/redis.client.js";

export async function getAssetCache(network_id, address) {
  try {
    const key = `assets:${network_id}`;
    const data = await redis.get(key);
    if (!data) return null;
    const assets = JSON.parse(data);
    return assets[address.toLowerCase()] ?? null;
  } catch (err) {
    console.error("❌ Asset updater failed:", err.message);
  }
}

export async function setAssetsToCache(networkId, assets) {
  const key = `assets:${networkId}`;

  // assets должен быть объектом: address -> asset
  await redis.set(
    key,
    JSON.stringify(assets),
    "EX",
    60 * 60, // 1 час TTL
  );

  console.log(
    `✅ Cached ${Object.keys(assets).length} assets for ${networkId}`,
  );
}

export async function getAssetsByNetworkCache(networkId) {
  try {
    const key = `assets:${networkId}`;
    const data = await redis.get(key);
    if (!data) return {};

    return JSON.parse(data);
  } catch (err) {
    console.error("❌ Asset updater failed:", err.message);
  }
}
