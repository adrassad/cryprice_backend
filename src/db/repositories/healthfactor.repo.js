export function createHFRepository(db) {
  return {
    async getLastHFByWalletId({ walletId, protocol, networkId }) {
      const res = await db.query(
        `
        SELECT *
        FROM healthfactors
        WHERE wallet_id = $1
            AND protocol = $2
            AND network_id = $3
        ORDER BY timestamp DESC
        LIMIT 1
        `,
        [walletId, protocol, networkId],
      );
      try {
        return res.rows[0] || null;
      } catch (err) {
        console.error(
          "⚠️ HealthFactorRepo.getLastHFByAddress failed:",
          err.message,
        );
        throw err;
      }
    },
    async create(data) {
      const normalizedHF =
        data.healthfactor === Infinity
          ? Infinity
          : Number(data.healthfactor.toFixed(2));
      const { rowCount } = await db.query(
        `
        INSERT INTO healthfactors (wallet_id, protocol, network_id, healthfactor)
        SELECT $1, $2, $3, $4
        WHERE NOT EXISTS (
          SELECT 1 FROM (
            SELECT healthfactor
            FROM healthfactors
            WHERE wallet_id = $1
              AND protocol = $2
              AND network_id = $3
            ORDER BY timestamp DESC
            LIMIT 1
          ) last
          WHERE last.healthfactor IS NOT DISTINCT FROM $4
        )
        RETURNING id;
        `,
        [data.wallet_id, data.protocol, data.network_id, normalizedHF],
      );
      return rowCount > 0;
    },
  };
}
