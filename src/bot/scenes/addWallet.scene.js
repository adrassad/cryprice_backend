// src/bot/scenes/addWallet.scene.js
import { Scenes, Markup } from 'telegraf';
import { SCENES } from '../constants/scenes.js';
import { BUTTONS } from '../constants/buttons.js';
import { addUserWallet } from '../../services/wallet.service.js';
import { handleReturn } from '../utils/returnTo.js';

export const addWalletScene = new Scenes.BaseScene(SCENES.ADD_WALLET);

/**
 * Вход в сцену
 */
addWalletScene.enter(async (ctx) => {
  await ctx.reply(
    '➕ Отправьте адрес кошелька Ethereum / Arbitrum\n\n' +
      'Пример:\n`0x1234...abcd`\n\n' +
      'Для отмены: /cancel',
    { parse_mode: 'Markdown' }
  );
});

/**
 * Отмена
 */
addWalletScene.command('cancel', async (ctx) => {
  await ctx.reply('❌ Добавление кошелька отменено');
  await ctx.scene.leave();
  await handleReturn(ctx);
});

/**
 * Обработка текста
 */
addWalletScene.on('text', async (ctx) => {
  const text = ctx.message.text.trim();

  // ❗ Игнорируем кнопки меню
  if (Object.values(BUTTONS).includes(text)) {
    return ctx.reply(
      'ℹ️ Сейчас идёт добавление кошелька.\n' +
      'Отправьте адрес или /cancel'
    );
  }

  // ❗ Игнорируем команды
  if (text.startsWith('/')) {
    return ctx.reply('❗ Отправьте адрес кошелька или /cancel');
  }

  try {
    await addUserWallet(ctx.from.id, text);

    await ctx.reply('✅ Кошелёк успешно добавлен');
    await ctx.scene.leave();
    await handleReturn(ctx);

  } catch (e) {
    switch (e.message) {
      case 'INVALID_ADDRESS':
        await ctx.reply(
          '❌ Невалидный адрес.\n\n' +
          'Отправьте корректный адрес Ethereum или /cancel'
        );
        break;

      case 'WALLET_ALREADY_EXISTS':
        await ctx.reply(
          '⚠️ Этот кошелёк уже добавлен.\n' +
          'Отправьте другой адрес или /cancel'
        );
        break;

      case 'FREE_LIMIT_REACHED':
        await ctx.reply(
          '❌ Бесплатно можно добавить только 1 кошелёк.\n\n' +
          'Оформите Pro подписку.',
          Markup.inlineKeyboard([
            Markup.button.callback('⭐ Upgrade to Pro', 'PRO_UPGRADE'),
          ])
        );
        await ctx.scene.leave();
        await handleReturn(ctx);
        break;
      
      case 'FREE_PERIOD_EXPIRED':
        await ctx.reply(
          '⏳ Ваш бесплатный период закончился.\n\n' +
          'Для добавления новых кошельков требуется Pro подписка.',
          Markup.inlineKeyboard([
            Markup.button.callback('⭐ Upgrade to Pro', 'PRO_UPGRADE'),
          ])
        );
        await ctx.scene.leave();
        await handleReturn(ctx);
        break;

      default:
        console.error(e);
        await ctx.reply('⚠️ Ошибка при добавлении кошелька.');
        await ctx.scene.leave();
        await handleReturn(ctx);
    }
  }
});
