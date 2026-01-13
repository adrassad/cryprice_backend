import { getUserStatus, isPro } from './user.service.js';

const FREE_WALLETS_LIMIT = 1;
const PRO_WALLETS_LIMIT = 10;

/*
 * Базовая проверка активности подписки
 * - есть подписка
 * - срок не истёк
 *
 * @returns {Promise<{ pro: boolean }>}
 */
async function assertSubscriptionActive(userId) {
  const status = await getUserStatus(userId);
  const pro = await isPro(userId);

  // подписка не активирована
  if (!status || !status.subscriptionEnd) {
    throw new Error('SUBSCRIPTION_REQUIRED');
  }

  // подписка истекла
  if (status.subscriptionEnd <= new Date()) {
    throw new Error(
      pro ? 'PRO_SUBSCRIPTION_EXPIRED' : 'FREE_PERIOD_EXPIRED'
    );
  }

  return { pro };
}

/**
 * Проверка доступа к просмотру позиций (/positions)
 */
export async function assertCanViewPositions(userId) {
  await assertSubscriptionActive(userId);
}

/**
 * Проверка возможности добавления нового кошелька
 */
export async function assertCanAddWallet(userId, walletCount) {
  const { pro } = await assertSubscriptionActive(userId);

  const limit = pro ? PRO_WALLETS_LIMIT : FREE_WALLETS_LIMIT;

  if (walletCount >= limit) {
    throw new Error(
      pro ? 'PRO_LIMIT_REACHED' : 'FREE_LIMIT_REACHED'
    );
  }
}
