// src/services/wallet.service.js
import { ethers } from 'ethers';
import { getAssetPriceUSD } from './price.service.js';
import { getWalletPositions } from './aave.service.js';

import {
  addWallet,
  removeWallet,
  getWalletsByUser,
  countWalletsByUser,
  walletExists,
} from '../db/repositories/wallet.repo.js';

import { isPro, getUserStatus } from './user.service.js';

const FREE_WALLETS_LIMIT = 1;
const PRO_WALLETS_LIMIT = 10;

function normalizeAddress(address) {
  return address.trim().toLowerCase();
}

export async function addUserWallet(userId, address, label = null) {
  // 🔐 Проверка адреса
  if (!ethers.isAddress(address)) {
    throw new Error('INVALID_ADDRESS');
  }

  const normalizedAddress = normalizeAddress(address);

  // 🔁 Проверка на существование
  const exists = await walletExists(userId, normalizedAddress);
  if (exists) {
    throw new Error('WALLET_ALREADY_EXISTS');
  }

  // 👤 Статус пользователя
  const userStatus = await getUserStatus(userId);
  const pro = await isPro(userId);
  const count = await countWalletsByUser(userId);

  /**
   * ❌ Free период закончился
   */
  if (
    !pro &&
    userStatus &&
    userStatus.subscriptionEnd &&
    userStatus.subscriptionEnd <= new Date()
  ) {
    throw new Error('FREE_PERIOD_EXPIRED');
  }

  /**
   * 🆓 Лимит free
   */
  if (!pro && count >= FREE_WALLETS_LIMIT) {
    throw new Error('FREE_LIMIT_REACHED');
  }

  /**
   * ⭐ Лимит pro
   */
  if (pro && count >= PRO_WALLETS_LIMIT) {
    throw new Error('PRO_LIMIT_REACHED');
  }

  return addWallet(userId, normalizedAddress, 'arbitrum', label);
}

export async function removeUserWallet(userId, walletId) {
  const removed = await removeWallet(userId, walletId);

  if (!removed) {
    throw new Error('WALLET_NOT_FOUND');
  }

  return removed;
}

export async function getUserWallets(userId) {
  return getWalletsByUser(userId);
}

/*
 * Рассчитать стоимость всех кошельков пользователя
 * @param {number} userId - ID пользователя
 * @returns {Promise<{total: number, breakdown: Array}>}
 */
export async function calcWalletValue(userId) {
  const wallets = await getUserWallets(userId);
  const breakdown = [];
  let total = 0;

  for (const w of wallets) {
    const positions = await getWalletPositions(w.address);

    for (const p of positions) {
      // цена токена в USD
      const price = await getAssetPriceUSD(p.asset);
      // сумма в USD
      const amountUsd = Number(p.aTokenBalance ?? 0n) / 1e18 * price;

      breakdown.push({
        wallet: w.address,
        asset: p.asset,
        amount: p.aTokenBalance,
        valueUsd: amountUsd,
        borrowedUsd: ((Number(p.variableDebt ?? 0n) + Number(p.stableDebt ?? 0n)) / 1e18) * price
      });

      total += amountUsd;
    }
  }

  return { total, breakdown };
}