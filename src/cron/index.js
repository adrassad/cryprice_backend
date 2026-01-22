//src/cron/index.js
import { startAssetSyncCron } from './assetsUpdater.cron.js';
import { startPriceSyncCron } from './priceUpdater.cron.js';

/**
 * 🚀 Запуск всех cron-задач
 */
export function startCrons() {
  console.log('🕒 Starting cron jobs...');
  startAssetSyncCron();
  startPriceSyncCron();
}
