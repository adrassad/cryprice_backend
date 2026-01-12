//src/db/repositories/price.repo.js
import { query } from '../index.js';
import { PRICE_CACHE } from '../../cache/memory.cache.js';

/*
 * Получить последнюю цену актива в USD по адресу
 */
export async function getLastPriceByAssetAddress(address) {
  const res = await query(
    `
    SELECT p.price_usd
    FROM prices p
    JOIN assets a ON p.asset_id = a.id
    WHERE a.address = $1
    ORDER BY p.timestamp DESC
    LIMIT 1
    `,
    [address.toLowerCase()]
  );

  return res.rows[0]?.price_usd ?? null;
}

/*
 * Вставляет цену в базу только если она реально изменилась
 * @param {number} assetId - id актива
 * @param {number} priceUsd - новая цена в USD
 */
export async function insertPriceIfChanged(assetId, priceUsd) {
  // Берем цену из кэша, если есть
  const cacheKey = `asset_${assetId}`;
  const cachedPrice = PRICE_CACHE[cacheKey];

  if (cachedPrice !== undefined) {
    // Проверяем "почти равенство" с дельтой 1e-8
    if (Math.abs(cachedPrice - priceUsd) < 1e-8) {
      return; // почти одинаково, не вставляем
    }
  }

  // Если кэша нет или цена изменилась, получаем последнюю из БД
  const last = await query(
    `
    SELECT price_usd
    FROM prices
    WHERE asset_id = $1
    ORDER BY timestamp DESC
    LIMIT 1
    `,
    [assetId]
  );

  const lastPrice = last.rows[0]?.price_usd ?? 0;

  if (Math.abs(lastPrice - priceUsd) < 1e-8) {
    // почти одинаково, не вставляем
    PRICE_CACHE[cacheKey] = lastPrice;
    return;
  }

  // Записываем новую цену
  await query(
    `
    INSERT INTO prices (asset_id, price_usd, timestamp)
    VALUES ($1, $2, NOW())
    `,
    [assetId, priceUsd]
  );

  // Обновляем кэш
  PRICE_CACHE[cacheKey] = priceUsd;
}
