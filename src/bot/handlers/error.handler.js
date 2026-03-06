//src/bot/handlers/error.handler.js
import { Markup } from "telegraf";
import { ERRORS } from "../constants/errors.js";
import { lanhuage } from "../locales/index.js";

export function registerGlobalErrorHandler(bot) {
  bot.catch(async (error, ctx) => {
    await handleBotError(ctx, error);
  });
}

async function handleBotError(ctx, error) {
  const code = error.code || error.message;

  switch (code) {
    case ERRORS.INVALID_ADDRESS:
      return ctx.reply(lanhuage(ctx.from.language_code, "novalid_address"));

    case ERRORS.WALLET_ALREADY_EXISTS:
      return ctx.reply(lanhuage(ctx.from.language_code, "wallet_you_have"));

    case ERRORS.FREE_LIMIT_REACHED:
    case ERRORS.FREE_PERIOD_EXPIRED:
    case ERRORS.PRO_SUBSCRIPTION_EXPIRED:
    case ERRORS.SUBSCRIPTION_REQUIRED:
      await ctx.reply(
        lanhuage(ctx.from.language_code, "subscribe_need_pro"),
        Markup.inlineKeyboard([
          Markup.button.callback("⭐ Upgrade to Pro", "PRO_UPGRADE"),
        ]),
      );
      return;

    case ERRORS.WALLET_NOT_FOUND:
      return ctx.reply(lanhuage(ctx.from.language_code, "no_wallet"));

    case ERRORS.USER_NOT_FOUND:
      return ctx.reply(lanhuage(ctx.from.language_code, "no_user"));

    default:
      console.error("UNHANDLED ERROR:", error);
      return ctx.reply(lanhuage(ctx.from.language_code, "error"));
  }
}
