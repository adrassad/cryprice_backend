//src/services/asset.service.js
import { db } from "../../db/index.js";
import {
  getAssetsByNetworkCache,
  setAssetsToCache,
} from "../../cache/asset.cache.js";
import { getAssets } from "../../blockchain/index.js";
import { getEnabledNetworks } from "../network/network.service.js";

export async function syncAssets() {
  console.log("⏱ Asset sync started");
  const networks = await getEnabledNetworks();

  for (const network of Object.values(networks)) {
    console.log(`🔗 Network: ${network.name}`);

    // 1️⃣ Получаем assets из blockchain
    const assets = await getAssets(network.name, "aave");

    // console.log("syncAssets ASSETS: ", Object.values(assets).length);
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
export async function getAssetByAddress(address) {
  return await db.assets.findByAddress(address);
}

//Получить все assets
export async function getAllAssets() {
  //console.log("getAllAssets: ");
  return await db.assets.getAll();
}

//Получить перечень assets по symbol
export async function getAssetBySymbol(symbol) {
  return await db.assets.findAllBySymbol(symbol);
}

export async function loadAssetsToCache(network_id) {
  //console.log("!!!!!!!!!!!!!!!!loadAssetsToCache");
  const assets = await db.assets.getByNetwork(network_id);
  await setAssetsToCache(network_id, assets);
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

  //console.log("getAssetsByNetworks: ", networks);
  const results = await Promise.all(
    networks.map(async (network) => ({
      name: network.name,
      assets: await getAssetsByNetworkCache(network.id),
    })),
  );
  return Object.fromEntries(results.map(({ name, assets }) => [name, assets]));
}
