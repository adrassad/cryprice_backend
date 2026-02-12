import { db } from "../../db/index.js";
import {
  setNetworksToCashe,
  getEnabledNetworksCache,
} from "../../cache/network.cashe.js";

export async function getEnabledNetworks() {
  return await getEnabledNetworksCache();
}

export async function loadNetworksToCache() {
  const networks = await db.networks.getNetworks();
  const mapNetworks = {};
  for (const network of networks) {
    mapNetworks[network.id] = {
      id: network.id,
      chain_id: network.chain_id,
      name: network.name.toLowerCase(),
      native_symbol: network.native_symbol,
      enabled: network.enabled,
    };
  }
  await setNetworksToCashe(mapNetworks);
}
