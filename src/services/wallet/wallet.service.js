// src/services/wallet.service.js
import { ethers } from "ethers";
import { getAssetPriceUSD } from "../price/price.service.js";
import { getWalletPositions } from "../aave.service.js";
import { assertCanAddWallet } from "../subscription/subscription.service.js";
import { db } from "../../db/index.js";

function normalizeAddress(address) {
  return address.trim().toLowerCase();
}

export async function addUserWallet(userId, address, label = null) {
  //🔐 ПРОВЕРКА ПОДПИСКИ
  const count = await db.wallets.countWalletsByUser(userId);
  await assertCanAddWallet(userId, count);

  // 🔐 Проверка адреса
  if (!ethers.isAddress(address)) {
    throw new Error("INVALID_ADDRESS");
  }

  const normalizedAddress = normalizeAddress(address);

  // 🔁 Проверка на существование
  const exists = await db.wallets.walletExists(userId, normalizedAddress);
  if (exists) {
    throw new Error("WALLET_ALREADY_EXISTS");
  }

  return db.wallets.addWallet(userId, normalizedAddress, "arbitrum", label);
}

export async function removeUserWallet(userId, walletId) {
  const removed = await db.wallets.removeWallet(userId, walletId);

  if (!removed) {
    throw new Error("WALLET_NOT_FOUND");
  }

  return removed;
}

export async function getUserWallets(userId) {
  return db.wallets.getWalletsByUser(userId);
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
    const positions = await getWalletPositions(userId, w.address);

    for (const p of positions) {
      // цена токена в USD
      const price = await getAssetPriceUSD(p.asset);
      // сумма в USD
      const amountUsd = (Number(p.aTokenBalance ?? 0n) / 1e18) * price;

      breakdown.push({
        wallet: w.address,
        asset: p.asset,
        amount: p.aTokenBalance,
        valueUsd: amountUsd,
        borrowedUsd:
          ((Number(p.variableDebt ?? 0n) + Number(p.stableDebt ?? 0n)) / 1e18) *
          price,
      });

      total += amountUsd;
    }
  }

  return { total, breakdown };
}
