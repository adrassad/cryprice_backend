import * as assetRepo from '../db/repositories/asset.repo.js';
import { ASSETS_CACHE } from '../cache/memory.cache.js';

/**
 * Загрузка ассетов (из Aave / chain / json)
 */
export async function loadAssets(assets) {
  for (const a of assets) {
    await assetRepo.upsertAsset({
      address: a.address,
      symbol: a.symbol,
      decimals: a.decimals
    });
  }
}

/**
 * Получить asset по адресу
 */
export async function getAssetByAddress(address) {
  return assetRepo.findByAddress(address);
}

//Получить все assets
export async function getAllAssets() {
  return assetRepo.getAll();
}

//Получить перечень assets по symbol
export async function getAssetBySymbol(symbol) {
  return assetRepo.findAllBySymbol(symbol);
}

export async function loadAssetsToCache() {
  const assets = await assetRepo.getAll();

  for (const asset of assets) {
    ASSETS_CACHE[asset.address.toLowerCase()] = {
      address: asset.address.toLowerCase(),
      symbol: asset.symbol,
      decimals: asset.decimals
    };
  }

  console.log(`✅ Loaded ${assets.length} assets into cache`);
}