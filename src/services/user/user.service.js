// src/services/user.service.js
import { db } from "../../db/index.js";
import { setUserToCache, getUserCache } from "../../cache/user.cache.js";

/**
 * Создать пользователя, если его нет
 */
export async function createIfNotExists(telegramId) {
  let user = await getUserCache(telegramId);

  if (!user) {
    user = await db.users.findByTelegramId(telegramId);
    if (!user) {
      user = await db.users.createUser(telegramId);
    }
    await setUserToCache(telegramId, user);
  }

  return user;
}

/**
 * Проверка PRO-подписки
 */
export async function isPro(telegramId) {
  const user = await getUserCache(telegramId);

  if (!user) return false;
  if (user.subscription_level !== "pro") return false;
  if (!user.subscription_end) return false;

  return new Date(user.subscription_end) > new Date();
}

/**
 * Статус пользователя (для /status)
 */
export async function getUserStatus(telegramId) {
  const user = await getUserCache(telegramId);

  if (!user) {
    return null;
  }

  const now = new Date();
  const end = user.subscription_end ? new Date(user.subscription_end) : null;

  const isActive = end ? end > now : false;

  return {
    level: user.subscription_level,
    subscriptionEnd: end,
    isActive,
  };
}

export async function loadUsersToCache() {
  const users = await db.users.getAllUsers();
  for (const user of users) {
    await setUserToCache(user.telegram_id, user);
  }
}
