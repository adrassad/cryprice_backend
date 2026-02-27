//src/cron/index.js

/**
 * 🚀 Запуск всех cron-задач
 */
export async function startCrons() {
  console.log("🕒 Starting cron jobs...", new Date().toISOString());

  await import("./assetsUpdater.cron.js");

  const { startPriceSyncCron } = await import("./priceUpdater.cron.js");
  await startPriceSyncCron();

  const { startHFSyncCron } = await import("./HFUpdater.cron.js");
  await startHFSyncCron();
}
