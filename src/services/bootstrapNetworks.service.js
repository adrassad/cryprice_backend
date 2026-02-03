import { networksConfig } from "../config/networks.config.js";
import { db } from "../db/index.js";
import { loadNetworksToCache } from "./network/network.service.js";

export async function bootstrapNetworksService() {
  const networks = Object.entries(networksConfig).map(([name, cfg]) => ({
    name,
    chain_id: cfg.CHAIN_ID,
    native_symbol: cfg.NATIVE_SYMBOL,
    enabled: cfg.ENABLED,
  }));
  //console.log("networks: ", networks);
  for (const network of networks) {
    await db.networks.create(network); // вызываем репозиторий
  }
  console.log("🌐 Networks bootstrapped");
  await loadNetworksToCache();
}
