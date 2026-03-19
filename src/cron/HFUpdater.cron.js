// src/cron/HFUpdater.cron.js
import cron from "node-cron";
import { syncHF } from "../integrations/private/hf-monitor.js";

let isRunning = false;

export async function startHFSyncCron() {
  if (isRunning) {
    console.log(
      "⏭ HealthFactor sync already running",
      new Date().toISOString(),
    );
    return;
  }
  isRunning = true;

  console.log("⏱ Updating HealthFactor...", new Date().toISOString());

  try {
    await syncHF();
    console.log(
      "✅ HealthFactor sync completed successfully",
      new Date().toISOString(),
    );
  } catch (e) {
    console.error(
      "❌ HealthFactor updater failed:",
      new Date().toISOString(),
      e,
    );
  } finally {
    isRunning = false;
  }
}

// 🚀 1. запуск сразу при старте приложения
//startHealthFactorSyncCron();

// ⏱ 2. запуск каждые 5 мин
cron.schedule("*/5 * * * *", startHFSyncCron);
