import { redis } from "../redis/redis.client.js";

export async function setNetworksToCashe(networks) {
  const key = "enabled_networks";
  await redis.set(
    key,
    JSON.stringify(networks),
    "EX",
    60 * 60, // 1 час TTL
  );
}

export async function getEnabledNetworksCache() {
  try {
    const data = await redis.get("enabled_networks");
    if (!data) return {};
    return JSON.parse(data);
  } catch (err) {
    console.warn("⚠️ Redis unavailable, skip enabled networks cache");
    return []; // 🔥 graceful fallback
  }
}
