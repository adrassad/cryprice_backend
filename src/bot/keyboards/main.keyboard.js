import { Markup } from 'telegraf';

export function mainKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('➕ Добавить кошелек', 'wallet:add')],
    [Markup.button.callback('➖ Удалить кошелек', 'wallet:remove')],
    [Markup.button.callback('⚡ Upgrade Pro', 'subscription:upgrade')]
  ]);
}
