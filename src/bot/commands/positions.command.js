// src/bot/commands/positions.command.js
import { Markup } from "telegraf";
import { getUserWallets } from "../../services/wallet/wallet.service.js";
import { getWalletPositions } from "../../services/aave.service.js";

export function positionsCommand(bot) {
  // Команда /positions
  bot.command("positions", async (ctx) => {
    const telegramId = ctx.from.id;
    const wallets = await getUserWallets(telegramId);

    if (!wallets.length) {
      return ctx.reply(
        "⚠️ У вас ещё нет кошельков. Добавьте через ➕ Add Wallet.",
      );
    }

    // Формируем кнопки для выбора кошелька
    const buttons = wallets.map((w) =>
      Markup.button.callback(w.address, `wallet_positions:${w.id}`),
    );

    await ctx.reply(
      "📊 Выберите кошелек для просмотра позиций:",
      Markup.inlineKeyboard(buttons, { columns: 1 }),
    );
  });

  // Обработка нажатия на кнопку кошелька
  bot.action(/wallet_positions:(\d+)/, async (ctx) => {
    const walletId = Number(ctx.match[1]);

    // Получаем кошелек из базы
    const wallets = await getUserWallets(ctx.from.id);
    const wallet = wallets.find((w) => w.id === walletId);

    if (!wallet) {
      await ctx.answerCbQuery("❌ Кошелек не найден");
      return;
    }

    await ctx.answerCbQuery(); // убираем "часики" Telegram

    try {
      let messages = [`💼 Кошелек: ${wallet.address}`];
      const networksPositions = await getWalletPositions(
        ctx.from.id,
        wallet.address,
      );

      for (const [networkName, data] of Object.entries(networksPositions)) {
        const { supplies, borrows, totals, healthFactor } = data;

        messages.push(`🔗 Network: ${networkName}`);
        if (!supplies.length && !borrows.length) {
          return ctx.reply(`ℹ️ Нет активных позиций в Aave.`);
        }

        messages.push(`💰 Net value: ${totals.netUsd.toFixed(2)}`);

        if (supplies.length) {
          let text = `📈 Supplied (Total: ${totals.suppliedUsd.toFixed(2)} USD):\n`;
          for (const s of supplies) {
            text += `• ${s.symbol}: ${(s.amount ?? 0).toFixed(5)} (${(s.usd ?? 0).toFixed(2)} USD)`;
            if (s.collateral) text += " 🔒 as collateral";
            text += "\n";
          }
          messages.push(text);
        }

        if (borrows.length) {
          //console.log('borrows: ', borrows);
          let text = `📉 Borrowed (Total: ${totals.borrowedUsd.toFixed(2)} USD):\n`;
          for (const b of borrows) {
            text += `• ${b.symbol}: ${(b.amount ?? 0).toFixed(5)} (${(b.usd ?? 0).toFixed(2)} USD)`;
            text += "\n";
          }
          messages.push(text);
        }

        messages.push(`🛡 Health Factor: ${healthFactor.toFixed(3)}`);

        // Отправляем все сообщения
        for (const msg of messages) {
          await ctx.reply(msg);
        }
      }
    } catch (e) {
      console.error(e);
      await ctx.reply("⚠️ Ошибка при получении позиций Aave.");
    }
  });
}
