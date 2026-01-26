//src/cron/priceUpdater.cron.js
import cron from "node-cron";
import { syncPrices } from "../services/price/price.service.js";

let isRunning = false;

export async function startPriceSyncCron() {
  if (isRunning) {
    console.log("⏭ Price sync already running");
    return;
  }
  isRunning = true;
  console.log("⏱ Updating prices...");
  try {
    await syncPrices();
    console.log("✅ Price sync completed successfully");
  } catch (e) {
    console.error("❌ Price updater failed:", e);
  } finally {
    isRunning = false;
  }
}

startPriceSyncCron();

cron.schedule("*/5 * * * *", startPriceSyncCron);
