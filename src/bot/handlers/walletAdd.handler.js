// src/bot/handlers/walletAdd.hears.js
import { button } from "../constants/buttons.js";
import { SCENES } from "../constants/scenes.js";
import { RETURNS } from "../constants/returns.js";

export function walletAddHears(bot) {
  bot.hears(button("en").ADD_WALLET, async (ctx) => {
    // ⬅️ ВАЖНО: сохраняем откуда пришли
    ctx.session.returnTo = RETURNS.MAIN_MENU;
    await ctx.scene.enter(SCENES.ADD_WALLET);
  });
}
