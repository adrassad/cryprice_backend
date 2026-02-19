import { redis } from "../redis/redis.client.js";

const TTL = 60 * 120;

function usersKey(userId) {
  return `users:${userId}`;
}

export async function setUserToCache(userId, user) {
  if (!redis || redis.status === "end") return;
  try {
    redis.set(usersKey(userId), JSON.stringify(user));
  } catch (err) {
    console.warn("⚠️ Redis setUserToCache failed:", err.message);
  }
}

export async function setUsersToCache(users) {
  if (!redis || redis.status === "end") return;
  try {
    for (const user of users) {
      redis.set(usersKey(user.userId), JSON.stringify(user));
    }
  } catch (err) {
    console.warn("⚠️ Redis setUsersToCache failed:", err.message);
  }
}

export async function delUserCache(userId) {
  if (!redis || redis.status === "end") return;
  try {
    await redis.del(usersKey(userId));
  } catch (err) {
    console.warn("⚠️ Redis delUserCache failed:", err.message);
  }
}

export async function getUserCache(userId) {
  const userJson = await redis.get(usersKey(userId));
  return JSON.parse(userJson);
}
