// src/services/wallet.service.js
import { ethers } from "ethers";
import { assertCanAddWallet } from "../subscription/subscription.service.js";
import { db } from "../../db/index.js";
import {
  setAllWalletsToCache,
  getWalletsByUser,
  setWalletsToCache,
  delWalletFromCache,
  getAllWalletsCache,
} from "../../cache/wallet.cache.js";

function normalizeAddress(address) {
  return address.trim().toLowerCase();
}

export async function addUserWallet(telegramId, address, label = null) {
  //🔐 ПРОВЕРКА ПОДПИСКИ
  const count = await db.wallets.exists(telegramId);
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

  const wallet = await db.wallets.create({
    telegramId,
    normalizedAddress,
    label,
  });
  let mapWallet = await getWalletsByUser(telegramId);
  mapWallet.set(normalizedAddress, wallet);

  setWalletsToCache(telegramId, mapWallet);

  return wallet;
}

export async function removeUserWallet(telegramId, walletId) {
  const removed = await db.wallets.deleteUserWallet(telegramId, walletId);

  if (!removed) {
    throw new Error("WALLET_NOT_FOUND");
  }
  delWalletFromCache(telegramId, walletId);
  return removed;
}

export async function getUserWallets(telegramId) {
  // 1️⃣ Пытаемся взять из кеша
  let walletsMap = await getWalletsByUser(telegramId);

  if (walletsMap && walletsMap.size > 0) {
    return walletsMap;
  }

  // 2️⃣ Cache miss → идем в БД
  const walletsFromDb = await db.wallets.findById(telegramId);

  const result = new Map();

  for (const wallet of walletsFromDb) {
    result.set(wallet.address, wallet);
  }

  // 3️⃣ Записываем в кеш
  if (result.size > 0) {
    await setWalletsToCache(telegramId, result);
  }

  return result;
}

export async function getUserWallet(telegramId, address) {
  const normalizedAddress = normalizeAddress(address);

  // 1️⃣ пробуем из кеша
  let walletsMap = await getWalletsByUser(telegramId);

  if (walletsMap && walletsMap.size > 0) {
    const wallet = walletsMap.get(normalizedAddress);
    if (wallet) return wallet;
  }

  // 2️⃣ cache miss → идем в БД
  const walletFromDb = await db.wallets.findOneByAddress(
    telegramId,
    normalizedAddress,
  );

  if (!walletFromDb) return null;

  // 3️⃣ обновляем кеш (чтобы не было частичного кеша)
  if (!walletsMap || walletsMap.size === 0) {
    walletsMap = new Map();
  }

  walletsMap.set(normalizedAddress, walletFromDb);
  await setWalletsToCache(telegramId, walletsMap);

  return walletFromDb;
}

export async function getAllWallets() {
  // 1️⃣ Пробуем кеш
  let wallets = await getAllWalletsCache();

  if (wallets && wallets.size > 0) {
    return wallets;
  }

  // 2️⃣ Cache miss → DB
  const result = await db.wallets.findAll();
  const grouped = new Map();

  for (const record of result) {
    const { address, ...rest } = record;

    if (!grouped.has(address)) {
      grouped.set(address, []);
    }

    grouped.get(address).push(rest);
  }

  // 3️⃣ Записываем в кеш
  if (grouped.size > 0) {
    await setAllWalletsToCache(grouped);
  }

  return grouped;
}

export async function loadWalletsToCache() {
  const walletsArray = Object.values(await db.wallets.findAll());
  const result = new Map();

  if (!Array.isArray(walletsArray) || walletsArray.length === 0) {
    return result;
  }

  for (const wallet of walletsArray) {
    const { id, user_id, address, label, created_at } = wallet;

    if (!user_id || !address) continue;

    // если у пользователя ещё нет Map — создаём
    if (!result.has(user_id)) {
      result.set(user_id, new Map());
    }

    const userWallets = result.get(user_id);

    userWallets.set(address, {
      id,
      user_id,
      address,
      label,
      created_at,
    });
  }
  await setAllWalletsToCache(result);
  console.log("✅ Cached wallets:", walletsArray.length);
}
