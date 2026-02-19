import { loadAllAssetsToCache } from "./asset/asset.service.js";

export async function bootstrapAssetsService() {
  await loadAllAssetsToCache();
  console.log("🌐 Assets bootstrapped", new Date().toISOString());
}
