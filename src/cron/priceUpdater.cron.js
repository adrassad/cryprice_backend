//src/cron/priceUpdater.cron.js
import cron from "node-cron";
import { syncPrices } from "../services/price/price.service.js";

export function startPriceSyncCron() {
  cron.schedule("* * * * *", async () => {
    console.log("⏱ Updating prices...");
    try {
      await syncPrices();
    } catch (e) {
      console.error("❌ Asset updater failed:", e);
    }
  });
}
