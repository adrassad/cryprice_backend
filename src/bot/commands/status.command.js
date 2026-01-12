import { getUserStatus } from '../../services/user.service.js';

export function statusCommand(bot) {
  bot.command('status', async (ctx) => {
    const userId = ctx.from.id;
    const status = await getUserStatus(userId);

    if (!status) {
      return ctx.reply('❌ Пользователь не найден');
    }

    const { level, subscriptionEnd, isActive } = status;

    const endText = subscriptionEnd
      ? subscriptionEnd.toLocaleDateString('ru-RU')
      : '—';

    const text =
      `📊 Статус подписки\n\n` +
      `Тип: ${level === 'pro' ? '⭐ Pro' : '🆓 Free'}\n` +
      `Доступ до: ${endText}\n` +
      `Статус: ${isActive ? '✅ активна' : '❌ истекла'}` +
      (!isActive
        ? `\n\n🔒 Для продолжения работы оформите Pro`
        : '');

    await ctx.reply(text);
  });
}
