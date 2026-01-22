// src/db/repositories/price.repo.js

export function createPriceRepository(db) {
  return {
    async getLastPriceByAssetAddress(address) {
      const res = await db.query(
        `
        SELECT p.price_usd
        FROM prices p
        JOIN assets a ON p.asset_id = a.id
        WHERE a.address = $1
        ORDER BY p.timestamp DESC
        LIMIT 1
        `,
        [address.toLowerCase()],
      );

      return res.rows[0]?.price_usd ?? null;
    },

    async savePrice(network_id, asset_id, priceUsd) {
      await db.query(
        `
        INSERT INTO prices (network_id, asset_id, price_usd, timestamp)
        VALUES ($1, $2, $3, NOW())
        `,
        [network_id, asset_id, priceUsd],
      );
    },
  };
}
