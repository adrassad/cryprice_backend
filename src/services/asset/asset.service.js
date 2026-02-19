//src/services/asset.service.js
import { db } from "../../db/index.js";
import {
  getAssetsByNetworkCache,
  setAssetsToCache,
  getAssetCache,
} from "../../cache/asset.cache.js";
import { getAssets } from "../../blockchain/index.js";
import { getEnabledNetworks } from "../network/network.service.js";

export async function syncAssets() {
  console.log("⏱ Asset sync started");
  const networks = await getEnabledNetworks();
  for (const network of Object.values(networks)) {
    console.log(`Asset 🔗${network.name} `, network.id);

    // 1️⃣ Получаем assets из blockchain
    const assets = await getAssets(network.name, "aave");

    // 2️⃣ Upsert assets в БД
    await upsertAssets(network.id, assets);

    // 3️⃣ Обновляем кеш ТОЛЬКО для этой сети
    await loadAssetsToCache(network.id);
  }
}

/**
 * Загрузка ассетов (из Aave / chain / json)
 */
export async function upsertAssets(network_id, assets) {
  for (const a of assets) {
    await db.assets.upsertAsset({
      network_id: network_id,
      address: a.address,
      symbol: a.symbol,
      decimals: a.decimals,
    });
  }
}

/**
 * Получить asset по адресу
 */
export async function getAssetByAddress(networkId, address) {
  if (!address || typeof address !== "string") return null;

  const normalizedAddress = address.toLowerCase();

  // 1️⃣ Сначала ищем в кэше
  const cached = await getAssetCache(networkId, normalizedAddress);
  if (cached) return cached;

  // 2️⃣ Если нет в кэше — ищем в БД
  const asset = await db.assets.findByAddress(networkId, normalizedAddress);
  if (!asset) return null;

  return asset;
}

//Получить все assets
export async function getAllAssets() {
  return await db.assets.getAll();
}

export async function getAsset(networkId, addressOrSymbol) {
  return getAssetCache(networkId, addressOrSymbol);
}

export async function loadAllAssetsToCache() {
  const networks = Object.values(await getEnabledNetworks());
  for (const network of networks) {
    await loadAssetsToCache(network.id);
  }
}

export async function loadAssetsToCache(network_id) {
  if (!network_id) return;
  const assets = await db.assets.getByNetwork(network_id);
  const assetsByAddress = {};
  for (const asset of assets) {
    assetsByAddress[asset.address.toLowerCase()] = {
      id: asset.id,
      network_id: asset.network_id,
      address: asset.address,
      symbol: asset.symbol,
      decimals: asset.decimals,
    };
  }
  await setAssetsToCache(network_id, assetsByAddress);
  console.log(
    `✅ Cached assets for network ${network_id}:`,
    Object.values(assetsByAddress).length,
  );
}

export async function getAssetsByNetwork(network_id) {
  return await getAssetsByNetworkCache(network_id);
}

export async function getAddressAssetsByNetwork(network_id) {
  const assets = await getAssetsByNetworkCache(network_id);
  const assetsArray = Object.values(assets);

  return Object.fromEntries(
    assetsArray.map((a) => [a.address.toLowerCase(), a]),
  );
}

export async function getAssetsByNetworks() {
  const networks = Object.values(await getEnabledNetworks());

  const results = await Promise.all(
    networks.map(async (network) => ({
      name: network.name,
      assets: await getAssetsByNetworkCache(network.id),
    })),
  );
  return Object.fromEntries(results.map(({ name, assets }) => [name, assets]));
}
