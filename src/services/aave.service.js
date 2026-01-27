// src/services/aave.service.js
import { getAaveUserPositions } from "../blockchain/index.js";
import { getEnabledNetworks } from "./network/network.service.js";
import { getAssetPriceUSD } from "./price/price.service.js";
import { getAssetByAddress } from "./asset/asset.service.js";
import { assertCanViewPositions } from "./subscription/subscription.service.js";

/*
 * Получение позиций пользователя в Aave
 * @param {number} userId - ID пользователя
 * @param {string} walletAddress - адрес кошелька
 * @param {string} networkName - имя сети ('arbitrum', 'ethereum' и т.д.)
 */
export async function getWalletPositions(userId, walletAddress) {
  // 🔐 Проверка подписки
  await assertCanViewPositions(userId);

  const networksPositions = {};
  // Получаем данные Aave через фасад

  console.log("⏱ Asset sync started");
  const networks = await getEnabledNetworks();

  for (const network of Object.values(networks)) {
    // console.log("network: ", network);
    //const { positions, healthFactor } = await getAaveUserPositions(
    const { positions = [], healthFactor = 0 } =
      (await getAaveUserPositions(network.name, "aave", walletAddress)) || {};
    const supplies = [];
    const borrows = [];
    let totalSuppliedUsd = 0;
    let totalBorrowedUsd = 0;
    //console.log("healthFactor: ", healthFactor);
    //console.log("positions: ", positions);
    for (const position of positions) {
      const assetAddress = position.assetAddress.toLowerCase();
      const asset = await getAssetByAddress(network.id, assetAddress);

      if (!asset) {
        console.warn("⚠️ Asset not found:", assetAddress);
        continue;
      }
      const { decimals, symbol, address } = asset;
      // console.log(
      //   "for getAssetPriceUSD network.id, asset : ",
      //   network.id,
      //   address,
      // );
      const priceUSD = await getAssetPriceUSD(network.id, address);

      if (position.aTokenBalance > 0n) {
        const amount = Number(position.aTokenBalance) / 10 ** decimals;
        const usd = amount * priceUSD;
        supplies.push({
          symbol: symbol,
          amount,
          usd,
          collateral: position.collateral,
        });
        totalSuppliedUsd += usd;
      }

      if (position.variableDebt > 0n || position.stableDebt > 0n) {
        const debt =
          Number(position.variableDebt + position.stableDebt) / 10 ** decimals;
        const usd = debt * priceUSD;
        borrows.push({
          symbol: symbol,
          amount: debt,
          usd,
        });
        totalBorrowedUsd += usd;
      }
    }

    networksPositions[network.name] = {
      supplies,
      borrows,
      totals: {
        suppliedUsd: totalSuppliedUsd,
        borrowedUsd: totalBorrowedUsd,
        netUsd: totalSuppliedUsd - totalBorrowedUsd,
      },
      healthFactor,
    };
  }
  //console.log("networksPositions", networksPositions);
  return networksPositions;
}
