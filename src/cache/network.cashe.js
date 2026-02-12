import { redis } from "../redis/redis.client.js";

const TTL = 60 * 60;

export async function setNetworksToCashe(networks) {
  if (!redis || redis.status === "end") return null;

  try {
    const pipeline = redis.pipeline();
    for (const network of Object.values(networks)) {
      const key = `enabled_networks:${network.id}`;
      pipeline.set(key, JSON.stringify(network), "EX", TTL);
      pipeline.sadd("enabled_networks:list", network.id);
    }
    pipeline.expire("enabled_networks:list", TTL);
    await pipeline.exec();
  } catch (err) {
    console.warn("⚠️ Redis setNetworksToCache failed:", err.message);
  }
}

export async function getNetworkCache(networkId) {
  if (!redis || redis.status === "end") return null;

  try {
    const key = `enabled_networks:${networkId}`;
    const raw = await redis.get(key);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error("❌ getAssetsByNetworkCache failed:", err.message);
    return {};
  }
}

export async function getEnabledNetworksCache() {
  if (!redis || redis.status === "end") return null;

  try {
    const ids = await redis.smembers("enabled_networks:list");
    if (!ids?.length) return {};

    const keys = ids.map((id) => `enabled_networks:${id}`);
    const values = await redis.mget(...keys);

    return values.reduce((acc, raw, index) => {
      //console.log("raw: ", raw);
      if (!raw) return acc;
      const network = JSON.parse(raw);
      if (network.enabled == false) return acc;
      acc[ids[index]] = network;
      //console.log("acc: ", acc);
      return acc;
    }, {});
  } catch (err) {
    console.warn(
      "⚠️ Redis unavailable, skip enabled networks cache",
      err.message,
    );
    return {};
  }
}
