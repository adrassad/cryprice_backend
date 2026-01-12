// src/services/user.service.js
import * as userRepo from '../db/repositories/user.repo.js';

/**
 * Создать пользователя, если его нет
 */
export async function createIfNotExists(telegramId) {
  const user = await userRepo.findByTelegramId(telegramId);

  if (!user) {
    await userRepo.create(telegramId);
    return {
      telegram_id: telegramId,
      subscription_level: 'free'
    };
  }

  return user;
}

/**
 * Проверка PRO-подписки
 */
export async function isPro(telegramId) {
  const user = await userRepo.findByTelegramId(telegramId);

  if (!user) return false;
  if (user.subscription_level !== 'pro') return false;
  if (!user.subscription_end) return false;

  return new Date(user.subscription_end) > new Date();
}

/**
 * Статус пользователя (для /status)
 */
export async function getUserStatus(telegramId) {
  const user = await userRepo.findByTelegramId(telegramId);

  if (!user) {
    return null;
  }

  const now = new Date();
  const end = user.subscription_end
    ? new Date(user.subscription_end)
    : null;

  const isActive = end ? end > now : false;

  return {
    level: user.subscription_level,
    subscriptionEnd: end,
    isActive
  };
}
