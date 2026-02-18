//src/bot/commands/healthfactor.command.js
import { Markup } from "telegraf";
import { getUserWallets } from "../../services/wallet/wallet.service.js";
import { formatHealthFactorOverview } from "../utils/hfFormatter.js";
import { collectHealthFactors } from "../../services/healthfactor/healthfactor.collector.js";
import { assertCanViewPositions } from "../../services/subscription/subscription.service.js";

export function healthFactorCommand(bot) {
  bot.command("healthfactor", async (ctx) => {
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
      Markup.button.callback(w.address, `wallet_healthfactor:${w.id}`),
    );

    await ctx.reply(
      "💼 Выберите кошелек для получения healthfactor на Aave:",
      Markup.inlineKeyboard(buttons, { columns: 1 }),
    );
  });

  bot.action(/wallet_healthfactor:(\d+)/, async (ctx) => {
    const walletId = Number(ctx.match[1]);
    const userId = ctx.from.id;

    await ctx.answerCbQuery();

    const resultMap = await collectHealthFactors({
      userId,
      walletId,
      checkChange: false,
    });

    const walletMap = resultMap.get(userId);

    if (!walletMap) {
      return ctx.reply("❌ Кошелек не найден");
    }

    const message = formatHealthFactorOverview(walletMap);

    await ctx.reply(message, { parse_mode: "HTML" });
  });
}
