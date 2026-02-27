//src/services/bootstrapABI.service.js
import { initBlockchain } from "../blockchain/index.js";

export async function bootstrapABIService() {
  console.log("⏱ Updating ABI...", new Date().toISOString());

  try {
    await initBlockchain();
    console.log("✅ ABI sync completed successfully", new Date().toISOString());
  } catch (e) {
    console.error("❌ ABI updater failed:", new Date().toISOString(), e);
  }
}
