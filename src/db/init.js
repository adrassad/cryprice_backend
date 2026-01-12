// src/db/initDb.js
import { query } from './index.js';

export async function initDb() {
  // ---- USERS ----
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      telegram_id BIGINT PRIMARY KEY,
      subscription_level TEXT NOT NULL DEFAULT 'free',
      subscription_end TIMESTAMP
    )
  `);

  // ---- ASSETS ----
  await query(`
    CREATE TABLE IF NOT EXISTS assets (
      id SERIAL PRIMARY KEY,
      address TEXT NOT NULL UNIQUE,
      symbol TEXT NOT NULL,
      decimals INTEGER NOT NULL
    )
  `);

  // ---- PRICES ----
  await query(`
    CREATE TABLE IF NOT EXISTS prices (
      id SERIAL PRIMARY KEY,
      asset_id INTEGER REFERENCES assets(id),
      price_usd NUMERIC NOT NULL,
      timestamp TIMESTAMP NOT NULL
    )
  `);

  // ---- MONITORS ----
  await query(`
    CREATE TABLE IF NOT EXISTS monitors (
      id SERIAL PRIMARY KEY,
      user_id BIGINT REFERENCES users(telegram_id),
      wallet_address TEXT,
      threshold NUMERIC,
      last_health_factor NUMERIC,
      last_alert_at TIMESTAMP
    )
  `);

  // ---- PAYMENTS_PENDING ----
  await query(`
    CREATE TABLE IF NOT EXISTS payments_pending (
      id SERIAL PRIMARY KEY,
      user_id BIGINT REFERENCES users(telegram_id),
      payment_address TEXT,
      amount_eth NUMERIC,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS wallets (
      id SERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL
        REFERENCES users(telegram_id)
        ON DELETE CASCADE,

      address TEXT NOT NULL,
      chain TEXT NOT NULL DEFAULT 'arbitrum',
      label TEXT,
      created_at TIMESTAMP DEFAULT NOW(),

      UNIQUE (user_id, address)
    )
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_wallets_user_id
    ON wallets(user_id);
  `);


  console.log('✅ All tables initialized');
}
