import { lanhuage } from "../locales/index.js";

//src/bot/commands/help.command.js
export function helpCommand(bot) {
  bot.command("help", async (ctx) => {
    await ctx.reply(lanhuage(ctx.from.language_code, "help_command"));
  });
}
