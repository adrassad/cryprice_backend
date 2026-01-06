import * as userRepo from '../db/repositories/user.repo.js';

async function createIfNotExists(telegramId) {
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

async function isPro(telegramId) {
  const user = await userRepo.findByTelegramId(telegramId);
  if (!user) return false;
  if (user.subscription_level !== 'pro') return false;
  if (!user.subscription_end) return false;

  return new Date(user.subscription_end) > new Date();
}

export const userService = {
  createIfNotExists,
  isPro
};
