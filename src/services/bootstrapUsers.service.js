import { loadUsersToCache } from "./user/user.service.js";

export async function bootstrapUsersService() {
  await loadUsersToCache();
  console.log("🌐 Users bootstrapped", new Date().toISOString());
}
