// src/bot/commands/positions.command.js
import { Markup } from "telegraf";
import { getUserWallets } from "../../services/wallet/wallet.service.js";
import { getWalletPositions } from "../../services/positions/position.service.js";
import { assertCanViewPositions } from "../../services/subscription/subscription.service.js";
import { formatPositionsOverview } from "../utils/formatPositionsOverview.js";
import pLimit from "p-limit";

const CONCURRENCY = 5;

export function positionsCommand(bot) {
  bot.command("positions", async (ctx) => {
    const userId = ctx.from.id;

    // 🔐 Проверка подписки
    await assertCanViewPositions(userId);

    const wallets = await getUserWallets(userId);

    if (!wallets.length) {
      return ctx.reply(
        "⚠️ У вас ещё нет кошельков. Добавьте через ➕ Add Wallet.",
      );
    }

    const buttons = wallets.map((w) =>
      Markup.button.callback(w.address, `wallet_positions:${w.id}`),
    );

    await ctx.reply(
      "💼 Выберите кошелек для просмотра позиций:",
      Markup.inlineKeyboard(buttons, { columns: 1 }),
    );
  });

  bot.action(/wallet_positions:(\d+)/, async (ctx) => {
    const walletId = Number(ctx.match[1]);
    const userId = ctx.from.id;

    await ctx.answerCbQuery(); // убираем "часики"

    const wallets = await getUserWallets(userId);
    const wallet = wallets.find((w) => w.id === walletId);

    if (!wallet) {
      return ctx.reply("❌ Кошелек не найден");
    }

    const networks = await getWalletPositions(userId, wallet.address);
    const resultMap = new Map();
    const walletMap = new Map();

    const limit = pLimit(CONCURRENCY);
    const tasks = [];

    for (const [networkName, data] of Object.entries(networks)) {
      tasks.push(
        limit(async () => {
          walletMap.set(networkName, data);
        }),
      );
    }

    await Promise.allSettled(tasks);

    resultMap.set(wallet.address, walletMap);

    const message = formatPositionsOverview(resultMap);
    await ctx.reply(message, { parse_mode: "HTML" });
  });
}
