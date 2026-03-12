import { BaseRepository } from "./base.repository.js";

export class UserRepository extends BaseRepository {
  constructor(db) {
    super(db, "users", "telegram_id");
  }

  async create(telegramId) {
    const result = await this.db.query(
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

    return result.rows[0] || null;
  }

  async updateUser(id, fields) {
    const allowedFields = ["subscription_level", "subscription_end"];

    return super.update(id, fields, allowedFields);
  }

  async getAllPro() {
    const res = await this.db.query(
      `SELECT *
       FROM users
       WHERE subscription_level ='pro'
       `,
    );

    return res.rows;
  }
}
