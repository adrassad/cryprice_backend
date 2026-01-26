import { redis } from "../redis/redis.client.js";

export async function setNetworkToCashe(dataNetwork) {
  const key = `networks:${dataNetwork.id}`;
  const network = {
    id: dataNetwork.id,
    chain_id: dataNetwork.chain_id,
    name: dataNetwork.name.toLowerCase(),
    native_symbol: dataNetwork.native_symbol,
    enabled: dataNetwork.enabled,
  };
  await redis.set(
    key,
    JSON.stringify(network),
    "EX",
    60 * 60, // 1 час TTL
  );

  console.log(`✅ Cached ${network} network for ${dataNetwork.id}`);
}

export async function getEnabledNetworksCache() {
  const keys = await redis.keys("networks:*"); // получаем все ключи сетей
  const networks = {};

  for (const key of keys) {
    const data = await redis.get(key);
    if (data) {
      const network = JSON.parse(data);
      if (network.enabled) {
        networks[network.id] = network;
      }
    }
  }

  return networks;
}
