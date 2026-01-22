//src/services/price.service.js
import { PRICE_CACHE } from "../../cache/memory.cache.js";
import { db } from "../../db/index.js";
import { getAssetsByNetwork } from "../asset/asset.service.js";
import { getEnabledNetworks } from "../network/network.service.js";
import { getPrices } from "../../blockchain/index.js";

export async function syncPrices() {
  const networks = await getEnabledNetworks();
  for (const network of Object.values(networks)) {
    console.log(`🔗 Network: ${network.id}`);
    const assets = await getAssetsByNetwork(network.id);
    //console.log("syncPrices assets", assets);
    const prices = await getPrices(network.name, "aave", assets);
    //console.log("syncPrices prices: ", prices);
    for (const price of Object.values(prices)) {
      //console.log("syncPrices price", price);
      const asset = assets[price.address];
      //console.log("syncPrices asset", asset);
      savePriceIfChanged(network.id, asset, price.price);
    }
  }
}

/**
 * Цена 1 токена в USD по адресу
 */
export async function getAssetPriceUSD(network_id, assetAddress) {
  const address = assetAddress.toLowerCase();
  // cache (address → price)
  if (PRICE_CACHE[network_id][address] !== undefined) {
    return PRICE_CACHE[network_id][address];
  }

  const asset = await assetRepo.findByAddress(address);
  if (!asset) return 0;

  const price = (await priceRepo.getLastPriceByAssetAddress(address)) ?? 0;

  PRICE_CACHE[network_id][address] = price;
  return price;
}

/*
 * Сохраняем цену токена по адресу (если изменилась)
 */
export async function savePriceIfChanged(network_id, asset, priceUsd) {
  if (!asset?.address) {
    console.warn("⚠️ asset.address is missing", asset);
    return;
  }

  ensureNetworkCache(network_id);

  const address = asset.address.toLowerCase();
  const lastPrice = PRICE_CACHE[network_id][address];

  // если цена не изменилась — ничего не делаем
  if (lastPrice !== undefined && Math.abs(lastPrice - priceUsd) < 1e-8) {
    return;
  }

  try {
    await db.prices.savePrice(network_id, asset.id, priceUsd);
    PRICE_CACHE[network_id][address] = priceUsd;
  } catch (e) {
    console.error(`❌ Failed to save price for ${asset.id}:`, e);
  }
}

function ensureNetworkCache(network_id) {
  if (!PRICE_CACHE[network_id]) {
    PRICE_CACHE[network_id] = {};
  }
}
