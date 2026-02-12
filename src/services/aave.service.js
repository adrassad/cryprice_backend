// src/services/aave.service.js
import { getUserPositions, getUserHealthFactor } from "../blockchain/index.js";
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
  const networks = await getEnabledNetworks();
  for (const network of Object.values(networks)) {
    let result = await getUserPositions(network.name, "aave", walletAddress);
    const positions = (await result.positions) || [];
    const healthFactor = result.healthFactor || 0;
    if (result.error) {
      networksPositions[network.name] = {
        error: result.error,
        healthFactor,
      };
      continue;
    }
    const supplies = [];
    const borrows = [];
    let totalSuppliedUsd = 0;
    let totalBorrowedUsd = 0;
    for (const position of positions) {
      const assetAddress = position.assetAddress.toLowerCase();
      const asset = await getAssetByAddress(network.id, assetAddress);

      if (!asset) continue;
      const { decimals, symbol, address } = asset;
      const price_usd = await getAssetPriceUSD(network.id, address);

      if (position.aTokenBalance > 0n) {
        const amount = Number(position.aTokenBalance) / 10 ** decimals;
        const usd = amount * price_usd;
        supplies.push({
          symbol,
          amount,
          usd,
          collateral: position.collateralEnabled,
        });
        totalSuppliedUsd += usd;
      }

      if (position.variableDebt > 0n || position.stableDebt > 0n) {
        const variableDebtAmount =
          Number(position.variableDebt) / 10 ** decimals;
        const stableDebtAmount = Number(position.stableDebt) / 10 ** decimals;
        const debt = variableDebtAmount + stableDebtAmount;
        const usd = debt * price_usd;
        borrows.push({
          symbol,
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
  return networksPositions;
}

export async function getWalletHealthFactor(userId, walletAddress) {
  // 🔐 Проверка подписки
  await assertCanViewPositions(userId);

  const networksPositions = {};
  // Получаем данные Aave через фасад
  const networks = await getEnabledNetworks();

  for (const network of Object.values(networks)) {
    let result = await getUserHealthFactor(network.name, "aave", walletAddress);
    const healthFactor = result || 0;

    networksPositions[network.name] = healthFactor;
  }
  return networksPositions;
}
