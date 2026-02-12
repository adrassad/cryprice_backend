import { createIfNotExists } from "../../services/user/user.service.js";
import { mainKeyboard } from "../keyboards/main.keyboard.js";

export function startCommand(bot) {
  bot.telegram.setMyCommands([
    { command: "start", description: "🚀 Перезапустить бота" },
    { command: "status", description: "💳 Статус подписки" },
    //{ command: 'help', description: '❓ Показать все команды' },
    { command: "positions", description: "📊 Показать мои позиции" },
    {
      command: "healthfactor",
      description: "🛡 Показать healthfacror на aave",
    },
  ]);
  bot.start(async (ctx) => {
    if (ctx.scene?.current) {
      await ctx.scene.leave();
    }
    await createIfNotExists(ctx.from.id);

    await ctx.reply(
      `👋 Добро пожаловать!\n\n
      🤖 Aave Health Monitor

Я отслеживаю health factor ваших кошельков в Aave (Arbitrum)
и присылаю уведомление, если он падает ниже заданного значения.
Бесплатный период 60 дней, далее необходимо оформить Pro-подписку.

🔔 Уведомления 24/7
💼 Поддержка нескольких кошельков
⚡ Pro-подписка для расширенных возможностей`,
      mainKeyboard(),
    );
  });
}
