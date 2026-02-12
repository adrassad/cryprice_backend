import { Markup } from "telegraf";
import { getUserWallets } from "../../services/wallet/wallet.service.js";
import { getWalletHealthFactor } from "../../services/aave.service.js";
import { formatHealthFactorForUI } from "../utils/formatters.js";

export function healthFactorCommand(bot) {
  bot.command("healthfactor", async (ctx) => {
    const telegramId = ctx.from.id;
    const wallets = await getUserWallets(telegramId);
    if (!wallets.length) {
      return ctx.reply(
        "⚠️ У вас ещё нет кошельков. Добавьте через ➕ Add Wallet.",
      );
    }
    // Формируем кнопки для выбора кошелька
    const buttons = wallets.map((w) =>
      Markup.button.callback(w.address, `wallet_healthfactor:${w.id}`),
    );

    await ctx.reply(
      "💼 Выберите кошелек для получения healthfactor на aave:",
      Markup.inlineKeyboard(buttons, { columns: 1 }),
    );
  });

  bot.action(/wallet_healthfactor:(\d+)/, async (ctx) => {
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
      //await ctx.reply(`💼 Кошелек: ${wallet.address}`);
      const networksPositions = await getWalletHealthFactor(
        ctx.from.id,
        wallet.address,
      );
      for (const [networkName, data] of Object.entries(networksPositions)) {
        await ctx.reply(`🔗 Network: ${networkName.toUpperCase()}`);
        await ctx.reply(`🛡 Health Factor: ${formatHealthFactorForUI(data)}`);
      }
    } catch (e) {
      console.error(e);
      await ctx.reply("⚠️ Ошибка при получении позиций Aave.");
    }
  });
}
