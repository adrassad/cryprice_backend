//src/bot/handlers/error.handler.js
import { Markup } from "telegraf";
import { ERRORS } from "../constants/errors.js";
import { handleReturn } from "../utils/returnTo.js";

export function registerGlobalErrorHandler(bot) {
  bot.catch(async (error, ctx) => {
    await handleBotError(ctx, error);
  });
}

async function handleBotError(ctx, error) {
  const code = error.code || error.message;

  switch (code) {
    case ERRORS.INVALID_ADDRESS:
      return ctx.reply(
        "❌ Невалидный адрес.\n\nОтправьте корректный адрес или /cancel",
      );

    case ERRORS.WALLET_ALREADY_EXISTS:
      return ctx.reply(
        "⚠️ Этот кошелёк уже добавлен.\nОтправьте другой адрес или /cancel",
      );

    case ERRORS.FREE_LIMIT_REACHED:
    case ERRORS.FREE_PERIOD_EXPIRED:
    case ERRORS.PRO_SUBSCRIPTION_EXPIRED:
    case ERRORS.SUBSCRIPTION_REQUIRED:
      await ctx.reply(
        "🔒 Требуется Pro подписка.",
        Markup.inlineKeyboard([
          Markup.button.callback("⭐ Upgrade to Pro", "PRO_UPGRADE"),
        ]),
      );
      return;

    case ERRORS.WALLET_NOT_FOUND:
      return ctx.reply("❌ Кошелек не найден");

    case ERRORS.USER_NOT_FOUND:
      return ctx.reply("❌ Пользователь не найден");

    default:
      console.error("UNHANDLED ERROR:", error);
      return ctx.reply("⚠️ Произошла ошибка. Попробуйте позже.");
  }
}
