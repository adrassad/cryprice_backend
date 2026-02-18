// src/db/repositories/user.repo.js

export function createUserRepository(db) {
  return {
    /*
     * Найти пользователя по Telegram ID
     * @param {number} telegramId
     */
    async findByTelegramId(telegramId) {
      const res = await db.query(`SELECT * FROM users WHERE telegram_id = $1`, [
        telegramId,
      ]);
      return res.rows[0] || null;
    },

    /*
     * Создать нового пользователя с дефолтной подпиской
     * @param {number} telegramId
     */
    async create(telegramId) {
      await db.query(
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
        `,
        [telegramId],
      );
    },

    /*
     * Обновить подписку пользователя
     * @param {number} telegramId
     * @param {string} level
     * @param {string|Date} endDate
     */
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
