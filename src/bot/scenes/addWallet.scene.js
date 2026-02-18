// src/bot/scenes/addWallet.scene.js
import { Scenes, Markup } from "telegraf";
import { SCENES } from "../constants/scenes.js";
import { BUTTONS } from "../constants/buttons.js";
import { addUserWallet } from "../../services/wallet/wallet.service.js";
import { handleReturn } from "../utils/returnTo.js";
import { assertCanViewPositions } from "../../services/subscription/subscription.service.js";

export const addWalletScene = new Scenes.BaseScene(SCENES.ADD_WALLET);

/**
 * Вход в сцену
 */
addWalletScene.enter(async (ctx) => {
  const userId = ctx.from.id;
  // 🔐 Проверка подписки
  await assertCanViewPositions(userId);

  await ctx.reply(
    "➕ Отправьте адрес кошелька Ethereum / Arbitrum\n\n" +
      "Пример:\n`0x1234...abcd`\n\n" +
      "Для отмены: /cancel",
    { parse_mode: "Markdown" },
  );
});

/**
 * Отмена
 */
addWalletScene.command("cancel", async (ctx) => {
  await ctx.reply("❌ Добавление кошелька отменено");
  await ctx.scene.leave();
  await handleReturn(ctx);
});

/**
 * Обработка текста
 */
addWalletScene.on("text", async (ctx) => {
  const text = ctx.message.text.trim();

  // ❗ Игнорируем кнопки меню
  if (Object.values(BUTTONS).includes(text)) {
    return ctx.reply(
      "ℹ️ Сейчас идёт добавление кошелька.\n" + "Отправьте адрес или /cancel",
    );
  }

  // ❗ Игнорируем команды
  if (text.startsWith("/")) {
    return ctx.reply("❗ Отправьте адрес кошелька или /cancel");
  }

  await addUserWallet(ctx.from.id, text);

  await ctx.reply("✅ Кошелёк успешно добавлен");
  await ctx.scene.leave();
  await handleReturn(ctx);
});
