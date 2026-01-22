// src/cron/priceUpdater.js
import cron from "node-cron";
import { syncAssets } from "../services/asset/asset.service.js";

export function startAssetSyncCron() {
  cron.schedule("* * * * *", async () => {
    console.log("⏱ Updating assets...");

    try {
      await syncAssets();
    } catch (e) {
      console.error("❌ Asset updater failed:", e);
    }
  });
}
