import { PostgresClient } from "./postgres.client.js";

const dbClient = new PostgresClient();

export async function initDb() {
  //
  // USERS
  //
  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS users (
      telegram_id BIGINT PRIMARY KEY,
      username TEXT,
      first_name TEXT,
      last_name TEXT,
      language TEXT,
      subscription_level TEXT NOT NULL DEFAULT 'free',
      subscription_end TIMESTAMPTZ,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      threshold_hf NUMERIC(10, 2) DEFAULT 1.2,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await dbClient.query(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW IS DISTINCT FROM OLD THEN
        NEW.updated_at = NOW();
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await dbClient.query(`
    DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
  `);

  await dbClient.query(`
    CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);

  //
  // WALLETS
  //
  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS wallets (
      id SERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL
        REFERENCES users(telegram_id)
        ON DELETE CASCADE,
      address TEXT NOT NULL,
      label TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),

      CONSTRAINT wallets_user_address_unique
        UNIQUE (user_id, address)
    );
  `);

  await dbClient.query(`
    CREATE INDEX IF NOT EXISTS idx_wallets_user_id
    ON wallets(user_id);
  `);

  await dbClient.query(`
    CREATE INDEX IF NOT EXISTS idx_wallets_address
    ON wallets(address);
  `);

  //
  // NETWORKS
  //
  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS networks (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      chain_id INTEGER NOT NULL UNIQUE,
      native_symbol TEXT NOT NULL,
      enabled BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  //
  // ASSETS
  //
  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS assets (
      id SERIAL PRIMARY KEY,

      network_id INTEGER NOT NULL
        REFERENCES networks(id)
        ON DELETE CASCADE,

      address TEXT NOT NULL,

      symbol TEXT NOT NULL,

      decimals INTEGER NOT NULL,

      CONSTRAINT assets_network_address_unique
        UNIQUE (network_id, address)
    );
  `);

  await dbClient.query(`
    CREATE INDEX IF NOT EXISTS idx_assets_network
    ON assets(network_id);
  `);

  await dbClient.query(`
    CREATE INDEX IF NOT EXISTS idx_assets_symbol
    ON assets(symbol);
  `);

  await dbClient.query(`
    CREATE INDEX IF NOT EXISTS idx_assets_address
    ON assets(address);
  `);

  //
  // PRICES
  //
  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS prices (
      id SERIAL PRIMARY KEY,

      network_id INTEGER NOT NULL
        REFERENCES networks(id)
        ON DELETE CASCADE,

      asset_id INTEGER NOT NULL
        REFERENCES assets(id)
        ON DELETE CASCADE,

      price_usd NUMERIC(38,18) NOT NULL,

      timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await dbClient.query(`
    CREATE INDEX IF NOT EXISTS idx_prices_lookup
    ON prices(network_id, asset_id, timestamp DESC);
  `);

  //
  // HEALTHFACTORS
  //
  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS healthfactors (
      id SERIAL PRIMARY KEY,

      address TEXT NOT NULL,

      protocol TEXT NOT NULL,

      network_id INTEGER NOT NULL
        REFERENCES networks(id)
        ON DELETE CASCADE,

      healthfactor DOUBLE PRECISION NOT NULL,

      timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await dbClient.query(`
    CREATE INDEX IF NOT EXISTS idx_hf_lookup
    ON healthfactors(address, protocol, network_id, timestamp DESC);
  `);

  await dbClient.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uniq_hf_exact
    ON healthfactors(address, protocol, network_id, timestamp);
  `);

  await dbClient.query(`
    CREATE INDEX IF NOT EXISTS idx_monitors_user
    ON monitors(user_id);
  `);

  //
  // PAYMENTS
  //
  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS payments_pending (
      id SERIAL PRIMARY KEY,

      user_id BIGINT
        REFERENCES users(telegram_id)
        ON DELETE CASCADE,

      payment_address TEXT NOT NULL,

      amount_eth NUMERIC(38,18) NOT NULL,

      status TEXT NOT NULL DEFAULT 'pending',

      created_at TIMESTAMPTZ DEFAULT NOW(),

      CONSTRAINT payments_status_check
        CHECK (status IN ('pending','confirmed','expired','failed'))
    );
  `);

  console.log("✅ DB initialized");
}
