//src/cron/priceUpdater.cron.js
import cron from "node-cron";
import { syncPrices } from "../services/price/price.service.js";
import { processPriceAlerts } from "../integrations/private/alert-gateway.js";

let isRunning = false;

export async function startPriceSyncCron() {
  if (isRunning) {
    console.log("⏭ Price sync already running", new Date().toISOString());
    return;
  }
  isRunning = true;
  console.log("⏱ Updating prices...", new Date().toISOString());
  try {
    const alerts = await syncPrices();
    if (alerts.size > 0) {
      await processPriceAlerts(alerts);
    }
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

cron.schedule("*/5 * * * *", startPriceSyncCron);
