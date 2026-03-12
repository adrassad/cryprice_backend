//src/services/price.service.js
import { getPriceCache, setPriceToCache } from "../../cache/price.cache.js";
import { db } from "../../db/index.js";
import { getAddressAssetsByNetwork } from "../asset/asset.service.js";
import { getEnabledNetworks } from "../network/network.service.js";
import { getPrices } from "../../blockchain/index.js";

export async function syncPrices() {
  const alertPrice = new Map();
  const networks = await getEnabledNetworks();
  for (const network of Object.values(networks)) {
    console.log(`Price 🔗${network.name} `, network.id);
    const lastPrices = await loadLastPricesToCacheNyNetwork(network.id);
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
      const change = diffPercent(lastPrices[price.address], price.price);
      if (change > 5) {
        let priceAddress = alertPrice.get(network);
        if (!priceAddress) {
          priceAddress = new Map();
        }
        const change =
          ((price.price - lastPrices[price.address].price_usd) /
            lastPrices[price.address].price_usd) *
          100;
        priceAddress.set(price.address, {
          asset,
          lastPrice: lastPrices[price.address],
          newPrice: price.price,
          change,
        });
        alertPrice.set(network, priceAddress);
      }
      await savePriceIfChanged(network, asset, price.price);
    }
  }
  return alertPrice;
}

function diffPercent(oldPrice, newPrice) {
  if (!oldPrice || oldPrice.price_usd === 0) return 0;

  return Math.abs((newPrice - oldPrice.price_usd) / oldPrice.price_usd) * 100;
}

export async function loadLastPricesToCache() {
  const networks = Object.values(await getEnabledNetworks());
  for (const network of networks) {
    await loadLastPricesToCacheNyNetwork(network.id);
  }
}

export async function loadLastPricesToCacheNyNetwork(network_id) {
  if (!network_id) return;
  const pricesDb = await db.prices.getLastPricesByNetwork(network_id);
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
  return prices;
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
  let lastPrice = 0;
  const dataPrice = await getPriceCache(network.id, address);
  if (dataPrice && dataPrice.price_usd) {
    lastPrice = dataPrice.price_usd;
  }

  // если цена не изменилась — ничего не делаем
  if (lastPrice !== undefined && Math.abs(lastPrice - priceUsd) < 1e-8) {
    return;
  }

  try {
    await db.prices.create({
      network_id: network.id,
      asset_id: asset.id,
      priceUsd: priceUsd,
    });
  } catch (e) {
    console.error(`❌ Failed to save price for ${asset.id}:`, e);
  }
}
