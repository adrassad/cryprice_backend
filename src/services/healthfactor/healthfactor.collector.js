// src/services/healthfactor/healthfactor.collector.js

import pLimit from "p-limit";
import { getEnabledNetworks } from "../network/network.service.js";
import {
  getAllWallets,
  getUserWallets,
  getUserWallet,
} from "../wallet/wallet.service.js";
import { calculateAndStoreHF } from "./healthfactor.core.js";
import { extractUniqueAddresses } from "../wallet/wallet.utils.js";

const CONCURRENCY = 5;

/*
 * Универсальный сборщик HealthFactor
 * @param {Object} params
 * @param {number|null} params.userId - конкретный пользователь
 * @param {number|null} params.walletId - конкретный кошелек
 * @param {boolean} params.checkChange - true для cron, false для бота
 * @returns Map<userId, Map<walletAddress, Map<networkName, healthfactor>>>
 */
export async function collectHealthFactors({
  userId = null,
  address = null,
  checkChange = false,
}) {
  const limit = pLimit(CONCURRENCY);

  let resultMap = new Map();
  const tasks = [];

  const networks = await getEnabledNetworks();

  // 🟢 2. Сбор HF → userId -> address -> network -> healthfactor
  const finalResult = new Map();

  // 🟢 1. Определяем набор кошельков
  let wallets;
  if (userId && address) {
    const wallet = await getUserWallet(userId, address);

    if (!wallet) return new Map();
    const mapHF = await calcHF(networks, [address], checkChange);
    const userAddressMap = new Map();
    for (const [address, networksHF] of mapHF.entries()) {
      const networkMap = new Map();
      for (const [network, hF] of networksHF.entries()) {
        networkMap.set(network, networksHF.get(network).healthfactor);
      }
      userAddressMap.set(address, networkMap);
    }
    finalResult.set(userId, userAddressMap);
  } else if (userId) {
    const userWallets = await getUserWallets(userId);
    const addresses = Object.keys(userWallets);
    const mapHF = await calcHF(networks, addresses);
    //пока не используется
  } else {
    resultMap = await getAllWallets();
    const addresses = extractUniqueAddresses(resultMap);
    const mapHF = await calcHF(networks, addresses, checkChange);
    for (const [uId, walletsMap] of resultMap.entries()) {
      const userAddressMap = new Map();
      let hfIsChanged = false;
      for (const address of walletsMap.keys()) {
        const networkMap = new Map();
        for (const network of Object.values(networks)) {
          const resultHF = mapHF.get(address)?.get(network.name);
          if (resultHF && resultHF.isChanged) {
            networkMap.set(network.name, resultHF.healthfactor);
            hfIsChanged = true;
          }
        }
        if (hfIsChanged) {
          userAddressMap.set(address, networkMap);
        }
      }
      if (hfIsChanged) {
        finalResult.set(uId, userAddressMap);
      }
    }
  }

  return finalResult;
}

async function calcHF(networks, addresses, checkChange) {
  const mapHF = new Map();
  for (const address of addresses) {
    const mNet = new Map();
    for (const network of Object.values(networks)) {
      const hfResult = await calculateAndStoreHF({
        address,
        network,
        checkChange,
      });
      if (hfResult.healthfactor) {
        mNet.set(network.name, hfResult);
      }
    }
    mapHF.set(address, mNet);
  }
  return mapHF;
}
