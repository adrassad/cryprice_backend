import { loadLastPricesToCache } from "./price/price.service.js";

export async function bootstrapPricesService() {
  await loadLastPricesToCache();
  console.log("🌐 Prices bootstrapped", new Date().toISOString());
}
