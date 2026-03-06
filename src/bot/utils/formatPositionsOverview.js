// src/bot/utils/formatPositionsOverview.js
import { formatHealthFactorForUI } from "./formatters.js";

/*
 * Превращает Map<walletAddress, Map<networkName, positionsData>> в красивое сообщение
 * @param {Map<string, Map<string, Object>>} walletMap
 * @returns {string} - текст для отправки в Telegram
 */
export function formatPositionsOverview(walletMap) {
  let message = "";

  for (const [walletAddress, networksMap] of walletMap.entries()) {
    message += `💼 Wallet: <code>${walletAddress}</code>\n\n`;

    for (const [networkName, data] of networksMap.entries()) {
      message += `🔗 ${networkName.toUpperCase()}\n`;

      if (data.error) {
        message += `❌ Error: ${data.error}\n`;
        message += `🛡 Health Factor: ${formatHealthFactorForUI(
          data.healthFactor,
        )}\n\n`;
        continue;
      }

      const { supplies, borrows, totals, healthFactor } = data;

      if (
        (!supplies || supplies.length === 0) &&
        (!borrows || borrows.length === 0)
      ) {
        message += `ℹ️ There are no active positions in Aave.\n\n`;
        continue;
      }

      message += `💰 Net value: $${totals.netUsd.toFixed(2)}\n`;

      if (supplies && supplies.length > 0) {
        message += `📈 Supplied (Total: $${totals.suppliedUsd.toFixed(2)}):\n`;
        for (const s of supplies) {
          message += `• ${s.symbol}: ${s.amount.toFixed(5)} ($${s.usd.toFixed(
            2,
          )})`;
          if (s.collateral) message += " 🔒 as collateral";
          message += "\n";
        }
      }

      if (borrows && borrows.length > 0) {
        message += `📉 Borrowed (Total: $${totals.borrowedUsd.toFixed(2)}):\n`;
        for (const b of borrows) {
          message += `• ${b.symbol}: ${b.amount.toFixed(5)} ($${b.usd.toFixed(
            2,
          )})\n`;
        }
      }

      message += `🛡 Health Factor: ${formatHealthFactorForUI(
        healthFactor,
      )}\n\n`;
    }
  }

  return message.trim();
}
