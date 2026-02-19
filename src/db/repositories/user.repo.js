// src/db/repositories/user.repo.js

export function createUserRepository(db) {
  return {
    async findByTelegramId(telegramId) {
      const res = await db.query(`SELECT * FROM users WHERE telegram_id = $1`, [
        telegramId,
      ]);
      return res.rows[0] || null;
    },

    async getAllUsers() {
      const res = await db.query(`SELECT * FROM users`);
      return res.rows || [];
    },

    async createUser(telegramId) {
      const result = await db.query(
        `
          INSERT INTO users (
            telegram_id,
            subscription_level,
            subscription_end
          )
          VALUES (
            $1,
            'free',
            NOW() + INTERVAL '30 days'
          )
          ON CONFLICT (telegram_id) DO NOTHING
          RETURNING *
          `,
        [telegramId],
      );

      return result.rows.length > 0 ? result.rows[0] : null;
    },

    async updateSubscription(telegramId, level, endDate) {
      await db.query(
        `UPDATE users
         SET subscription_level = $2, subscription_end = $3
         WHERE telegram_id = $1`,
        [telegramId, level, endDate],
      );
    },
  };
}
