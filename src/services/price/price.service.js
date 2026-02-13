//src/services/price.service.js
import {
  getPricesBySymbolCache,
  getPriceCache,
  setPriceToCache,
} from "../../cache/price.cache.js";
import { db } from "../../db/index.js";
import { getAddressAssetsByNetwork } from "../asset/asset.service.js";
import { getEnabledNetworks } from "../network/network.service.js";
import { getPrices } from "../../blockchain/index.js";

export async function syncPrices() {
  const networks = await getEnabledNetworks();
  for (const network of Object.values(networks)) {
    console.log(`🔗${network.name} `, network.id);
    await loadPricesToCache(network.id);
    const assets = await getAddressAssetsByNetwork(network.id);
    const prices = await getPrices(network.name, "aave", Object.values(assets));
    for (const price of Object.values(prices)) {
      const asset = assets[price.address.toLowerCase()];
      if (!asset?.address) {
        console.warn(
          "⚠️ asset.address is missing price.address:",
          price.address,
        );
        continue;
      }
      await savePriceIfChanged(network, asset, price.price);
    }
    await loadPricesToCache(network.id);
  }
}

export async function loadPricesToCache(network_id) {
  if (!network_id) return;
  const pricesDb = await db.prices.getLastPriceByNetwork(network_id);
  const prices = {};
  for (const price of pricesDb) {
    prices[price.address.toLowerCase()] = {
      price_usd: Number(price.price_usd),
      symbol: price.symbol,
      timestamp: price.timestamp,
    };
  }
  await setPriceToCache(network_id, prices);
  console.log(
    `✅ Cached price for network ${network_id}:`,
    Object.values(prices).length,
  );
}
/**
 * Цена 1 токена в USD по адресу
 */
export async function getAssetPriceUSD(network_id, assetAddress) {
  const address = assetAddress.toLowerCase();
  // cache (address → price)
  const dataPrice = await getPriceCache(network_id, address);
  if (dataPrice && dataPrice.price_usd != 0) {
    return dataPrice.price_usd;
  }
  return 0;
}

export async function getAssetPrice(network_id, assetAddress) {
  const address = assetAddress.toLowerCase();
  const dataPrice = await getPriceCache(network_id, address);
  return dataPrice;
}

/*
 * Сохраняем цену токена по адресу (если изменилась)
 */
export async function savePriceIfChanged(network, asset, priceUsd) {
  if (!asset?.address || !asset?.id) {
    // console.warn(
    //   "⚠️ asset.address is missing asset, network, priceUsd:",
    //   asset,
    //   network,
    //   priceUsd,
    // );
    return;
  }
  const address = asset.address.toLowerCase();
  const lastPrice = 0;
  const dataPrice = await getPriceCache(network.id, address);
  if (dataPrice && dataPrice.priceUSD) {
    lastPrice = dataPrice.priceUSD;
  }

  // если цена не изменилась — ничего не делаем
  if (lastPrice !== undefined && Math.abs(lastPrice - priceUsd) < 1e-8) {
    return;
  }

  try {
    await db.prices.savePrice(network.id, asset.id, priceUsd);
  } catch (e) {
    console.error(`❌ Failed to save price for ${asset.id}:`, e);
  }
}
