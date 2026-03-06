// src/bot/scenes/addWallet.scene.js
import { Scenes, Markup } from "telegraf";
import { SCENES } from "../constants/scenes.js";
import { button } from "../constants/buttons.js";
import { addUserWallet } from "../../services/wallet/wallet.service.js";
import { handleReturn } from "../utils/returnTo.js";
import { assertCanViewPositions } from "../../services/subscription/subscription.service.js";
import { lanhuage } from "../locales/index.js";

export const addWalletScene = new Scenes.BaseScene(SCENES.ADD_WALLET);

/**
 * Вход в сцену
 */
addWalletScene.enter(async (ctx) => {
  const userId = ctx.from.id;
  // 🔐 Проверка подписки
  await assertCanViewPositions(userId);

  await ctx.reply(lanhuage(ctx.from.language_code, "wallet_send"), {
    parse_mode: "Markdown",
  });
});

/**
 * Отмена
 */
addWalletScene.command("cancel", async (ctx) => {
  await ctx.reply(lanhuage(ctx.from.language_code, "wallet_send_canceled"));
  await ctx.scene.leave();
  await handleReturn(ctx);
});

/**
 * Обработка текста
 */
addWalletScene.on("text", async (ctx) => {
  const text = ctx.message.text.trim();

  // ❗ Игнорируем кнопки меню
  if (Object.values(button(ctx.from.language_code)).includes(text)) {
    return ctx.reply(lanhuage(ctx.from.language_code, "wallet_sending"));
  }

  // ❗ Игнорируем команды
  if (text.startsWith("/")) {
    return ctx.reply(lanhuage(ctx.from.language_code, "wallet_send"));
  }

  await addUserWallet(ctx.from.id, text);

  await ctx.reply(lanhuage(ctx.from.language_code, "wallet_added"));
  await ctx.scene.leave();
  await handleReturn(ctx);
});
