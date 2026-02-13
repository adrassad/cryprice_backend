// src/cron/assetsUpdater.cron.js
import cron from "node-cron";
import { syncAssets } from "../services/asset/asset.service.js";

let isRunning = false;

export async function startAssetSyncCron() {
  if (isRunning) {
    console.log("⏭ Asset sync already running", new Date().toISOString());
    return;
  }
  isRunning = true;

  console.log("⏱ Updating assets...", new Date().toISOString());

  try {
    await syncAssets();
    console.log(
      "✅ Asset sync completed successfully",
      new Date().toISOString(),
    );
  } catch (e) {
    console.error("❌ Asset updater failed:", new Date().toISOString(), e);
  } finally {
    isRunning = false;
  }
}

// 🚀 1. запуск сразу при старте приложения
startAssetSyncCron();

// ⏱ 2. запуск каждый час
cron.schedule("0 * * * *", startAssetSyncCron);
