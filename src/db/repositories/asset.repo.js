import { query } from '../index.js';

/**
 * Создать или обновить asset по address
 */
export async function upsertAsset({ address, symbol, decimals }) {
  return query(
    `
    INSERT INTO assets (address, symbol, decimals)
    VALUES ($1, $2, $3)
    ON CONFLICT (address)
    DO UPDATE SET
      symbol = EXCLUDED.symbol,
      decimals = EXCLUDED.decimals
    `,
    [
      address.toLowerCase(),
      symbol,
      decimals
    ]
  );
}

/**
 * Получить asset по адресу
 */
export async function findByAddress(address) {
  const res = await query(
    `SELECT * FROM assets WHERE address = $1`,
    [address.toLowerCase()]
  );
  return res.rows[0] || null;
}

/**
 * Получить все assets
 */
export async function getAll() {
  const res = await query(`SELECT * FROM assets`);
  return res.rows;
}

/*
 * Получить все assets по symbol
 * @param {string} symbol
 * @returns {Promise<Array<{id:number,address:string,symbol:string,decimals:number}>>}
 */
export async function findAllBySymbol(symbol) {
  const res = await query(
    `
    SELECT id, address, symbol, decimals
    FROM assets
    WHERE symbol = $1
    ORDER BY address
    `,
    [symbol.toUpperCase()]
  );

  return res.rows;
}