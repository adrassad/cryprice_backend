// src/db/repositories/asset.repo.js

export function createAssetRepository(db) {
  return {
    async upsertAsset({ network_id, address, symbol, decimals }) {
      return db.query(
        `
        INSERT INTO assets (network_id, address, symbol, decimals)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (address)
        DO UPDATE SET
          symbol = EXCLUDED.symbol,
          decimals = EXCLUDED.decimals
        `,
        [network_id, address.toLowerCase(), symbol, decimals],
      );
    },

    async findByAddress(networkId, address) {
      const res = await db.query(`SELECT * FROM assets WHERE address = $1`, [
        address,
      ]);
      return res.rows[0] || null;
    },

    async getAll() {
      const res = await db.query(`SELECT * FROM assets`);
      return res.rows;
    },

    async getByNetwork(network_id) {
      const res = await db.query(`SELECT * FROM assets WHERE network_id = $1`, [
        network_id,
      ]);
      return res.rows;
    },

    async findAllBySymbol(symbol) {
      const res = await db.query(
        `
        SELECT 
          a.id, 
          a.address, 
          a.symbol, 
          a.decimals,
          n.name,
          n.chain_id
      FROM assets a
      JOIN networks n
          ON a.network_id = n.id
      WHERE a.symbol = $1
      ORDER BY a.address;

        `,
        [symbol.toUpperCase()],
      );
      return res.rows;
    },
  };
}
