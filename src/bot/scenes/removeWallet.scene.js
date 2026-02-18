import { Scenes, Markup } from "telegraf";
import { SCENES } from "../constants/scenes.js";
import { getUserWallets } from "../../services/wallet/wallet.service.js";
import { assertCanViewPositions } from "../../services/subscription/subscription.service.js";

export const removeWalletScene = new Scenes.BaseScene(SCENES.REMOVE_WALLET);

removeWalletScene.enter(async (ctx) => {
  const userId = ctx.from.id;
  // 🔐 Проверка подписки
  await assertCanViewPositions(userId);

  const wallets = await getUserWallets(userId);

  if (!wallets.length) {
    await ctx.reply("❌ У вас нет кошельков");
    return ctx.scene.leave();
  }

  await ctx.reply(
    "🗑 Выберите кошелёк для удаления:",
    Markup.inlineKeyboard(
      wallets.map((w) =>
        Markup.button.callback(
          `${w.label ?? w.address.slice(0, 6) + "..."}`,
          `WALLET_DELETE:${w.id}`,
        ),
      ),
    ),
  );
});
