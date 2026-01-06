import { query } from '../index.js';

export async function findByTelegramId(telegramId) {
  const res = await query(
    `SELECT * FROM users WHERE telegram_id = $1`,
    [telegramId]
  );
  return res.rows[0];
}

export async function create(telegramId) {
  await query(
    `INSERT INTO users (telegram_id, subscription_level)
     VALUES ($1, 'free')
     ON CONFLICT (telegram_id) DO NOTHING`,
    [telegramId]
  );
}

export async function updateSubscription(telegramId, level, endDate) {
  await query(
    `UPDATE users
     SET subscription_level = $2, subscription_end = $3
     WHERE telegram_id = $1`,
    [telegramId, level, endDate]
  );
}
