// src/bot/handlers/walletDelete.handler.js
import { removeUserWallet } from "../../services/wallet/wallet.service.js";
import { lanhuage } from "../locales/index.js";

export function walletDeleteHandler(bot) {
  bot.action(/^WALLET_DELETE:/, async (ctx) => {
    const userId = ctx.from.id;
    const walletId = ctx.callbackQuery.data.split(":")[1];

    try {
      await removeUserWallet(userId, walletId);

      await ctx.answerCbQuery(
        lanhuage(ctx.from.lanhuage_code, "wallet_deleted"),
      );
      await ctx.editMessageText(
        lanhuage(ctx.from.lanhuage_code, "wallet_deleted_success"),
      );
    } catch (e) {
      console.error(e);
      await ctx.answerCbQuery(
        lanhuage(ctx.from.lanhuage_code, "wallet_deleted_error"),
      );
      await ctx.reply(
        lanhuage(ctx.from.lanhuage_code, "wallet_deleted_failed"),
      );
    }
  });
}
