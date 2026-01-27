//src/services/price.service.js
import { getPriceCache, setPriceToCache } from "../../cache/price.cache.js";
import { db } from "../../db/index.js";
import { getAddressAssetsByNetwork } from "../asset/asset.service.js";
import { getEnabledNetworks } from "../network/network.service.js";
import { getPrices } from "../../blockchain/index.js";

export async function syncPrices() {
  const networks = await getEnabledNetworks();
  for (const network of Object.values(networks)) {
    console.log(`🔗 Network: ${network.id}`);
    const assets = await getAddressAssetsByNetwork(network.id);
    //console.log("syncPrices assets", Object.values(assets));
    const prices = await getPrices(network.name, "aave", Object.values(assets));
    // console.log("syncPrices prices", Object.values(prices).length);
    //console.log("syncPrices prices: ", prices);
    for (const price of Object.values(prices)) {
      //console.log("syncPrices price", price);
      const asset = assets[price.address.toLowerCase()];
      if (!asset?.address) {
        console.warn(
          "⚠️ asset.address is missing price.address:",
          price.address,
        );
        continue;
      }
      //console.log("!!!!!!!!!!!!!!!savePriceIfChanged!!!!!!!!!!!!!!!!!!!");
      await savePriceIfChanged(network, asset, price.price);
    }
  }
}

/**
 * Цена 1 токена в USD по адресу
 */
export async function getAssetPriceUSD(network_id, assetAddress) {
  const address = assetAddress.toLowerCase();
  // cache (address → price)
  const dataPrice = await getPriceCache(network_id, address);
  if (!dataPrice && dataPrice.priceUSD != 0) {
    return dataPrice.priceUSD;
  }

  const asset = await db.assets.findByAddress(network_id, address);
  if (!asset) return 0;

  const price = (await db.prices.getLastPriceByAssetAddress(address)) ?? 0;

  await setPriceToCache(network_id, address, price);

  return price;
}

/*
 * Сохраняем цену токена по адресу (если изменилась)
 */
export async function savePriceIfChanged(network, asset, priceUsd) {
  if (!asset?.address) {
    // console.warn(
    //   "⚠️ asset.address is missing asset, network, priceUsd:",
    //   asset,
    //   network,
    //   priceUsd,
    // );
    return;
  }
  //console.log("savePriceIfChanged asset", asset);
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
    await setPriceToCache(network.id, address.toLowerCase(), {
      priceUsd: priceUsd,
      symbol: asset.symbol,
      chain_id: network.chain_id,
      native_symbol: network.native_symbol,
      chain_name: network.name,
    });
  } catch (e) {
    console.error(`❌ Failed to save price for ${asset.id}:`, e);
  }
}
