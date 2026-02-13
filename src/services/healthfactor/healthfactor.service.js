//src/services/healthfactor/healthfactor.service.js
import { db } from "../../db/index.js";
import { getUserHealthFactor } from "../../blockchain/index.js";
import { getEnabledNetworks } from "../network/network.service.js";
import { getAllWallets } from "../wallet/wallet.service.js";
import { NotificationService } from "../../bot/notification.service.js";
import { formatHealthFactorForUI } from "../../bot/utils/formatters.js";

export async function syncHF() {
  console.log("⏱ Asset sync started", new Date().toISOString());
  const networks = await getEnabledNetworks();
  const wallets = await getAllWallets();
  for (const [address, records] of wallets.entries()) {
    for (const record of records) {
      for (const network of Object.values(networks)) {
        const hf = await getUserHealthFactor(network.name, "aave", address);
        let healthfactor = 0;
        if (hf != Infinity) {
          healthfactor = hf.toFixed(2);
        }
        const data = {
          wallet_id: record.id,
          protocol: "aave",
          network_id: network.id,
          healthfactor: healthfactor,
        };
        const isChanged = await db.hf.create(data);
        if (isChanged) {
          const textMessage = `
          💼 ${address}
          🔗 ${network.name.toUpperCase()}
          ⚠️ Aave Health Rate ${formatHealthFactorForUI(healthfactor)}`;
          await NotificationService.sendToUser(record.user_id, textMessage);
        }
      }
    }
  }
}
