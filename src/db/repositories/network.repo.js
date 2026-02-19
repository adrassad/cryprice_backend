//src/db/repositories/network.repo.js

// src/db/repositories/network.repo.js

export function createNetworkRepository(db) {
  return {
    async getNetworks() {
      const res = await db.query(`SELECT * FROM networks`);
      return res.rows;
    },

    async getNetworkById() {
      const res = await db.query(`SELECT * FROM networks WHERE id = $1`, [
        telegramId,
      ]);
      return res.rows[0] || null;
    },

    async create(network) {
      await db.query(
        `
        INSERT INTO networks (name, chain_id, native_symbol, enabled)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (name) DO UPDATE
          SET
            chain_id = EXCLUDED.chain_id,
            native_symbol = EXCLUDED.native_symbol,
            enabled = EXCLUDED.enabled
        `,
        [
          network.name,
          network.chain_id,
          network.native_symbol,
          network.enabled,
        ],
      );
    },
  };
}
