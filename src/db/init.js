// src/db/initDb.js
import { PostgresClient } from "./postgres.client.js";

const dbClient = new PostgresClient();

export async function initDb() {
  // ---- USERS ----
  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS users (
      telegram_id BIGINT PRIMARY KEY,
      subscription_level TEXT NOT NULL DEFAULT 'free',
      subscription_end TIMESTAMP
    )
  `);

  // ---- WALLETS ----
  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS wallets (
      id SERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL
        REFERENCES users(telegram_id)
        ON DELETE CASCADE,
      address TEXT NOT NULL,
      label TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (user_id, address)
    )
  `);
  await dbClient.query(`
    CREATE INDEX IF NOT EXISTS idx_wallets_user_id
    ON wallets(user_id);
  `);

  // ---- NETWORKS ----
  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS networks (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,       
      chain_id INTEGER NOT NULL UNIQUE,
      native_symbol TEXT NOT NULL,     
      enabled BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // ---- ASSETS ----
  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS assets (
      id SERIAL PRIMARY KEY,
      network_id INTEGER NOT NULL
        REFERENCES networks(id)
        ON DELETE CASCADE,
      address TEXT NOT NULL UNIQUE,
      symbol TEXT NOT NULL,
      decimals INTEGER NOT NULL
    )
  `);

  // ---- PRICES ----
  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS prices (
      id SERIAL PRIMARY KEY,
      network_id INTEGER NOT NULL
        REFERENCES networks(id)
        ON DELETE CASCADE,
      asset_id INTEGER REFERENCES assets(id),
      price_usd NUMERIC(38,18) NOT NULL,
      timestamp TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  await dbClient.query(`
    CREATE INDEX IF NOT EXISTS idx_prices_network_asset_timestamp
    ON prices(network_id, asset_id, timestamp DESC);
  `);

  // ---- HEALTHFACTORS ----
  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS healthfactors (
      id SERIAL PRIMARY KEY,
      wallet_id INTEGER NOT NULL
        REFERENCES wallets(id)
        ON DELETE CASCADE,
      protocol TEXT NOT NULL,
      network_id INTEGER NOT NULL
        REFERENCES networks(id)
        ON DELETE CASCADE,
      healthfactor DOUBLE PRECISION NOT NULL,
      timestamp TIMESTAMP NOT NULL DEFAULT NOW()
    );

  `);
  // Индекс для быстрого поиска последнего HF
  await dbClient.query(`
    CREATE INDEX IF NOT EXISTS idx_healthfactors_wallet_protocol_network_timestamp
    ON healthfactors(wallet_id, protocol, network_id, timestamp DESC);
  `);
  // Уникальный индекс, чтобы исключить дублирование записи в одно и то же время
  await dbClient.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uniq_healthfactors_wallet_protocol_network_timestamp
    ON healthfactors(wallet_id, protocol, network_id, timestamp);
  `);

  // ---- MONITORS ----
  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS monitors (
      id SERIAL PRIMARY KEY,
      user_id BIGINT REFERENCES users(telegram_id),
      wallet_address TEXT,
      threshold NUMERIC(38,18),
      last_health_factor NUMERIC(38,18),
      last_alert_at TIMESTAMP
    )
  `);
  await dbClient.query(`
    CREATE INDEX IF NOT EXISTS idx_monitors_user_id
    ON monitors(user_id);
  `);

  // ---- PAYMENTS_PENDING ----
  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS payments_pending (
      id SERIAL PRIMARY KEY,
      user_id BIGINT REFERENCES users(telegram_id),
      payment_address TEXT,
      amount_eth NUMERIC(38,18),
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  console.log("✅ All tables initialized", new Date().toISOString());
}
