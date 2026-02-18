// src/services/wallet.service.js
import { ethers } from "ethers";
import { assertCanAddWallet } from "../subscription/subscription.service.js";
import { db } from "../../db/index.js";

function normalizeAddress(address) {
  return address.trim().toLowerCase();
}

export async function addUserWallet(telegramId, address, label = null) {
  //🔐 ПРОВЕРКА ПОДПИСКИ
  const count = await db.wallets.countWalletsByUser(telegramId);
  await assertCanAddWallet(telegramId, count);

  // 🔐 Проверка адреса
  if (!ethers.isAddress(address)) {
    throw new Error("INVALID_ADDRESS");
  }

  const normalizedAddress = normalizeAddress(address);

  // 🔁 Проверка на существование
  const exists = await db.wallets.walletExists(telegramId, normalizedAddress);
  if (exists) {
    throw new Error("WALLET_ALREADY_EXISTS");
  }

  return db.wallets.addWallet(telegramId, normalizedAddress, label);
}

export async function removeUserWallet(telegramId, walletId) {
  const removed = await db.wallets.removeWallet(telegramId, walletId);

  if (!removed) {
    throw new Error("WALLET_NOT_FOUND");
  }

  return removed;
}

export async function getUserWallets(telegramId) {
  return db.wallets.getWalletsByUser(telegramId);
}

export async function getAllWallets() {
  const result = await db.wallets.getAllWallets();
  const wallets = new Map();

  for (const record of result) {
    const { address, ...rest } = record;

    if (!wallets.has(address)) {
      wallets.set(address, []);
    }

    wallets.get(address).push(rest);
  }
  return wallets;
}
