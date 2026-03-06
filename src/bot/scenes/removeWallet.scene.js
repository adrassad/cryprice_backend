import { Scenes, Markup } from "telegraf";
import { SCENES } from "../constants/scenes.js";
import { getUserWallets } from "../../services/wallet/wallet.service.js";
import { assertCanViewPositions } from "../../services/subscription/subscription.service.js";
import { lanhuage } from "../locales/index.js";

export const removeWalletScene = new Scenes.BaseScene(SCENES.REMOVE_WALLET);

removeWalletScene.enter(async (ctx) => {
  const userId = ctx.from.id;
  // 🔐 Проверка подписки
  await assertCanViewPositions(userId);

  const wallets = await getUserWallets(userId);

  if (!wallets.size) {
    await ctx.reply(lanhuage(ctx.from.language_code, "command_wallet_no_add"));
    return ctx.scene.leave();
  }

  const buttons = [];

  wallets.forEach((value, key) => {
    buttons.push(
      Markup.button.callback(value.address, `WALLET_DELETE:${value.address}`),
    );
  });

  await ctx.reply(
    lanhuage(ctx.from.language_code, "wallet_select_delete"),
    Markup.inlineKeyboard(buttons, { columns: 1 }),
  );
});
