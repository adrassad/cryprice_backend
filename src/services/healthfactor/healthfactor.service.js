// src/services/healthfactor/healthfactor.service.js

import pLimit from "p-limit";
import { db } from "../../db/index.js";
import { getUserHealthFactor } from "../../blockchain/index.js";
import { getEnabledNetworks } from "../network/network.service.js";
import { getAllWallets } from "../wallet/wallet.service.js";
import { NotificationService } from "../../bot/notification.service.js";
import { formatHealthFactorOverview } from "../../bot/utils/hfFormatter.js";

const RPC_CONCURRENCY = 5; // сколько RPC одновременно
const DB_CONCURRENCY = 10; // сколько insert одновременно

export async function syncHF() {
  console.log("⏱ HealthFactor sync started", new Date().toISOString());
  console.time("HF_SYNC");

  const networks = await getEnabledNetworks();
  const wallets = await getAllWallets();

  const rpcLimit = pLimit(RPC_CONCURRENCY);
  const dbLimit = pLimit(DB_CONCURRENCY);

  const userWalletNetHF = new Map();
  const tasks = [];

  for (const [address, records] of wallets.entries()) {
    for (const record of records) {
      for (const network of Object.values(networks)) {
        tasks.push(
          rpcLimit(() =>
            processWalletNetwork(
              address,
              record,
              network,
              userWalletNetHF,
              dbLimit,
            ),
          ),
        );
      }
    }
  }

  await Promise.allSettled(tasks);

  if (userWalletNetHF.size > 0) {
    await sendMessageToUsers(userWalletNetHF);
  }

  console.timeEnd("HF_SYNC");
}

async function processWalletNetwork(
  address,
  record,
  network,
  userWalletNetHF,
  dbLimit,
) {
  try {
    const rawHF = await getUserHealthFactor(network.name, "aave", address);

    // ✅ безопасная нормализация
    const healthfactor =
      rawHF === Infinity ? Infinity : Number(Number(rawHF).toFixed(2));

    const data = {
      wallet_id: record.id,
      protocol: "aave",
      network_id: network.id,
      healthfactor,
    };

    // ✅ ограничиваем нагрузку на БД
    const isChanged = await dbLimit(() => db.hf.create(data));

    // ✅ защита от спама — если не изменилось, не уведомляем
    if (!isChanged) return;

    if (!userWalletNetHF.has(record.user_id)) {
      userWalletNetHF.set(record.user_id, new Map());
    }

    const walletMap = userWalletNetHF.get(record.user_id);

    if (!walletMap.has(address)) {
      walletMap.set(address, new Map());
    }

    walletMap.get(address).set(network.name, healthfactor);
  } catch (err) {
    console.error(
      `HF error: wallet=${address} network=${network.name}`,
      err.message,
    );
  }
}

async function sendMessageToUsers(userWalletNetHF) {
  await Promise.allSettled(
    [...userWalletNetHF.entries()].map(([userId, walletMap]) =>
      NotificationService.sendToUser(
        userId,
        formatHealthFactorOverview(walletMap),
        { parse_mode: "HTML" },
      ),
    ),
  );
}
