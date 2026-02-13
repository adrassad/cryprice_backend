//src/cron/priceUpdater.cron.js
import cron from "node-cron";
import { syncPrices } from "../services/price/price.service.js";

let isRunning = false;

export async function startPriceSyncCron() {
  if (isRunning) {
    console.log("⏭ Price sync already running", new Date().toISOString());
    return;
  }
  isRunning = true;
  console.log("⏱ Updating prices...", new Date().toISOString());
  try {
    await syncPrices();
    console.log(
      "✅ Price sync completed successfully",
      new Date().toISOString(),
    );
  } catch (e) {
    console.error("❌ Price updater failed:", new Date().toISOString(), e);
  } finally {
    isRunning = false;
  }
}

await startPriceSyncCron();

cron.schedule("*/5 * * * *", startPriceSyncCron);
