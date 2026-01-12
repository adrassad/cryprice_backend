//src/services/price.service.js
import { PRICE_CACHE } from '../cache/memory.cache.js';
import * as priceRepo from '../db/repositories/price.repo.js';
import * as assetRepo from '../db/repositories/asset.repo.js';

/**
 * Цена 1 токена в USD по адресу
 */
export async function getAssetPriceUSD(assetAddress) {
  const address = assetAddress.toLowerCase();

  // cache (address → price)
  if (PRICE_CACHE[address] !== undefined) {
    return PRICE_CACHE[address];
  }

  const asset = await assetRepo.findByAddress(address);
  if (!asset) return 0;

  const price = await priceRepo.getLastPriceByAssetAddress(address) ?? 0;

  PRICE_CACHE[address] = price;
  return price;
}

/*
 * Сохраняем цену токена по адресу (если изменилась)
 */
export async function savePrice(assetAddress, priceUsd) {
  const address = assetAddress.toLowerCase();

  try {
    const asset = await assetRepo.findByAddress(address);
    if (!asset) {
      console.warn(`⚠️ Asset not found for address ${address}`);
      return;
    }

    await priceRepo.insertPriceIfChanged(asset.id, priceUsd);

    // обновляем кеш только если asset найден и цена проверена
    PRICE_CACHE[address] = priceUsd;
  } catch (e) {
    console.error(`❌ Failed to save price for ${address}:`, e);
  }
}
