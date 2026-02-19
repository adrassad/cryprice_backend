import { networksConfig } from "../config/networks.config.js";
import {
  createNetworks,
  loadNetworksToCache,
} from "./network/network.service.js";

export async function bootstrapNetworksService() {
  const networks = Object.entries(networksConfig).map(([name, cfg]) => ({
    name,
    chain_id: cfg.CHAIN_ID,
    native_symbol: cfg.NATIVE_SYMBOL,
    enabled: cfg.ENABLED,
  }));

  // Сервис знает про базу и кэш
  await createNetworks(networks);
  await loadNetworksToCache();

  console.log("🌐 Networks bootstrapped", new Date().toISOString());
}
