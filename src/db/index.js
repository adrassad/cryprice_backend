// src/db/index.js
import { PostgresClient } from "./postgres.client.js";
import { createUserRepository } from "./repositories/user.repo.js";
import { createNetworkRepository } from "./repositories/network.repo.js";
import { createAssetRepository } from "./repositories/asset.repo.js";
import { createPriceRepository } from "./repositories/price.repo.js";
import { createWalletRepository } from "./repositories/wallet.repo.js";
import { createHFRepository } from "./repositories/healthfactor.repo.js";

const dbClient = new PostgresClient();

export const db = {
  users: createUserRepository(dbClient),
  networks: createNetworkRepository(dbClient),
  assets: createAssetRepository(dbClient),
  prices: createPriceRepository(dbClient),
  wallets: createWalletRepository(dbClient),
  hf: createHFRepository(dbClient),
};
