import { createIfNotExists } from "../../services/user/user.service.js";
import { mainKeyboard } from "../keyboards/main.keyboard.js";
import { lanhuage } from "../locales/index.js";

export function startCommand(bot) {
  bot.telegram.setMyCommands(
    [
      { command: "start", description: "🚀 Перезапустить бота" },
      { command: "status", description: "💳 Статус подписки" },
      { command: "positions", description: "📊 Показать мои позиции" },
      {
        command: "healthfactor",
        description: "🛡 Показать healthfactor на Aave",
      },
      { command: "help", description: "❓ Показать все команды" },
      { command: "support", description: "💬 Написать в поддержку" },
    ],
    { language_code: "ru" },
  );

  bot.telegram.setMyCommands(
    [
      { command: "start", description: "🚀 Restart bot" },
      { command: "status", description: "💳 Subscription status" },
      { command: "positions", description: "📊 Show my positions" },
      { command: "healthfactor", description: "🛡 Show Aave healthfactor" },
      { command: "help", description: "❓ Show all commands" },
      { command: "support", description: "💬 Contact support" },
    ],
    { language_code: "en" },
  );
  bot.start(async (ctx) => {
    if (ctx.scene?.current) {
      await ctx.scene.leave();
    }
    await createIfNotExists(ctx.from.id);

    await ctx.reply(
      lanhuage(ctx.from.language_code, "start_welcome"),
      mainKeyboard(),
    );
  });
}
