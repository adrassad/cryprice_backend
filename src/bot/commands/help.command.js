export function helpCommand(bot) {
  bot.command('help', async (ctx) => {
    await ctx.reply(
      `ℹ️ Доступные команды:
/start — начать
/help — помощь`
    );
  });
}
