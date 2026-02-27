// src/app/bootstrap.js
import { initDb } from "../db/init.js";
import { bootstrapNetworksService } from "../services/bootstrapNetworks.service.js";
import { bootstrapUsersService } from "../services/bootstrapUsers.service.js";
import { bootstrapAssetsService } from "../services/bootstrapAssets.service.js";
import { bootstrapPricesService } from "../services/bootstrapPrices.service.js";
import { bootstrapWalletsService } from "../services/bootstrapWallets.service.js";
import { bootstrapABIService } from "../services/bootstrapABI.service.js";

export async function bootstrapApp() {
  await initDb();
  await bootstrapABIService();
  await bootstrapNetworksService();
  await bootstrapUsersService();
  await bootstrapAssetsService();
  await bootstrapPricesService();
  await bootstrapWalletsService();
}
