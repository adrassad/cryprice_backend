//src/bot/handlers/upgrade.handler.js
import { lanhuage } from "../locales/index.js";

export function upgradeHandler(bot) {
  bot.action("PRO_UPGRADE", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(
      "🚀 Upgrade to PRO\n\n" + lanhuage(ctx.from.language_code, "upgrade_pro"),
    );
  });
}
