import { fromTwos } from "ethers";
import { NotificationService } from "../../bot/notification.service.js";
import { getAllProUsers } from "../user/user.service.js";

export async function processPriceAlerts(alerts) {
  const message = messagePriceAlert(alerts);
  for (const user of await getAllProUsers()) {
    await NotificationService.sendToUser(user.telegram_id, message, {
      parse_mode: "HTML",
    });
  }
}

export function messagePriceAlert(alerts) {
  let message = `🚨 <b>Price Alert</b>\n\n`;

  for (const [network, assets] of alerts) {
    message += `🌐 <b>Network:</b> <code>${network.name}</code>\n`;

    for (const [address, data] of assets) {
      const { asset, lastPrice, newPrice, change } = data;

      const oldPrice = lastPrice?.price_usd ?? 0;

      const direction = change > 0 ? "📈" : "📉";

      message += `
        <b>${asset.symbol}</b>
        <code>${address}</code>
        Old: <b>$${oldPrice}</b>
        New: <b>$${newPrice}</b>
        Change: ${direction} <b>${change.toFixed(2)}%</b>

        `;
    }

    message += `\n`;
  }

  return message;
}
