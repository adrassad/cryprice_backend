import { userService } from '../../services/user.service.js';
import { mainKeyboard } from '../keyboards/main.keyboard.js';

export function startCommand(bot) {
  bot.start(async (ctx) => {
    await userService.createIfNotExists(ctx.from.id);

    await ctx.reply(
      '👋 Добро пожаловать!\n\nУправляйте своими кошельками:',
      mainKeyboard()
    );
  });
}
