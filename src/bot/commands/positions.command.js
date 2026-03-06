// src/bot/commands/positions.command.js
import { Markup } from "telegraf";
import {
  getUserWallets,
  getUserWallet,
} from "../../services/wallet/wallet.service.js";
import { getWalletPositions } from "../../services/positions/position.service.js";
import { assertCanViewPositions } from "../../services/subscription/subscription.service.js";
import { formatPositionsOverview } from "../utils/formatPositionsOverview.js";
import pLimit from "p-limit";
import { lanhuage } from "../locales/index.js";

const CONCURRENCY = 5;

export function positionsCommand(bot) {
  bot.command("positions", async (ctx) => {
    const userId = ctx.from.id;

    // 🔐 Проверка подписки
    await assertCanViewPositions(userId);

    const wallets = await getUserWallets(userId);

    if (!wallets.size) {
      return ctx.reply(lanhuage(ctx.from.language_code, command_wallet_no_add));
    }

    const buttons = [];

    wallets.forEach((value, key) => {
      buttons.push(
        Markup.button.callback(
          value.address,
          `wallet_positions:${value.address}`,
        ),
      );
    });

    await ctx.reply(
      lanhuage(ctx.from.language_code, "command_show_positions"),
      Markup.inlineKeyboard(buttons, { columns: 1 }),
    );
  });

  bot.action(/wallet_positions:(.+)/, async (ctx) => {
    const address = ctx.match[1];
    const userId = ctx.from.id;

    await ctx.answerCbQuery(); // убираем "часики"

    const wallet = await getUserWallet(userId, address);

    if (!wallet) {
      return ctx.reply(lanhuage(ctx.from.language_code, "no_wallet"));
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
