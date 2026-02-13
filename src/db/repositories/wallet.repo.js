// src/db/repositories/wallet.repo.js

export function createWalletRepository(db) {
  return {
    async addWallet(userId, address, label = null) {
      const res = await db.query(
        `
        INSERT INTO wallets (user_id, address, label)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, address) DO NOTHING
        RETURNING *
        `,
        [userId, address.toLowerCase(), label],
      );
      return res.rows[0] || null;
    },

    async removeWallet(userId, walletId) {
      const res = await db.query(
        `
        DELETE FROM wallets
        WHERE id = $1 AND user_id = $2
        RETURNING *
        `,
        [walletId, userId],
      );
      return res.rows[0] || null;
    },

    async getWalletsByUser(userId) {
      const res = await db.query(
        `
        SELECT id, address, label, created_at
        FROM wallets
        WHERE user_id = $1
        ORDER BY created_at ASC
        `,
        [userId],
      );
      return res.rows;
    },

    async getAllWallets() {
      const res = await db.query(
        `
        SELECT id, user_id, address,  label, created_at
        FROM wallets
        ORDER BY created_at ASC
        `,
      );
      return res.rows;
    },

    async countWalletsByUser(userId) {
      const res = await db.query(
        `
        SELECT COUNT(*)::int AS count
        FROM wallets
        WHERE user_id = $1
        `,
        [userId],
      );
      return res.rows[0].count;
    },

    async walletExists(userId, address) {
      const res = await db.query(
        `
        SELECT 1
        FROM wallets
        WHERE user_id = $1 AND address = $2
        LIMIT 1
        `,
        [userId, address.toLowerCase()],
      );
      return res.rowCount > 0;
    },
  };
}
