import { RETURNS } from "../constants/returns.js";
import { mainKeyboard } from "../keyboards/main.keyboard.js";
import { lanhuage } from "../locales/index.js";

export async function handleReturn(ctx) {
  const target = ctx.session.returnTo;

  // очистка
  delete ctx.session.returnTo;

  switch (target) {
    case RETURNS.MAIN_MENU:
      await ctx.reply(
        lanhuage(ctx.from.lanhuage_code, "main_menu"),
        mainKeyboard(),
      );
      break;

    default:
      // если returnTo не задан
      break;
  }
}
