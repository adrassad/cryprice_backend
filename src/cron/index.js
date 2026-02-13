//src/cron/index.js
import { startAssetSyncCron } from "./assetsUpdater.cron.js";
import { startPriceSyncCron } from "./priceUpdater.cron.js";
import { startHealthFactorSyncCron } from "./healthfactorUpdater.js";

/**
 * 🚀 Запуск всех cron-задач
 */
export async function startCrons() {
  console.log("🕒 Starting cron jobs...", new Date().toISOString());
  await startAssetSyncCron();
  await startPriceSyncCron();
  await startHealthFactorSyncCron();
}
