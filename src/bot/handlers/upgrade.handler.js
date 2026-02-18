//src/bot/handlers/upgrade.handler.js
export function upgradeHandler(bot) {
  bot.action("upgrade_pro", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(
      "🚀 PRO подписка скоро будет доступна.\nОплата в ETH в разработке.",
    );
  });
}
