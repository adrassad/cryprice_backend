import { getUserStatus } from "../../services/user/user.service.js";
import { lanhuage } from "../locales/index.js";

export function statusCommand(bot) {
  bot.command("status", async (ctx) => {
    const userId = ctx.from.id;
    const status = await getUserStatus(userId);

    if (!status) {
      return ctx.reply(lanhuage(ctx.from.language_code, "no_user"));
    }

    const { level, subscriptionEnd, isActive } = status;

    const endText = subscriptionEnd
      ? subscriptionEnd.toLocaleDateString("ru-RU")
      : "—";

    const text =
      lanhuage(ctx.from.language_code, "subscribe_status") +
      lanhuage(ctx.from.language_code, "subscribe_type") +
      ` ${level === "pro" ? "⭐ Pro" : "🆓 Free"}\n` +
      lanhuage(ctx.from.language_code, "subscribe_rules") +
      ` ${endText}\n` +
      lanhuage(ctx.from.language_code, "status") +
      ` ${
        isActive
          ? lanhuage(ctx.from.language_code, "active")
          : lanhuage(ctx.from.language_code, "expired")
      }` +
      (!isActive ? lanhuage(ctx.from.language_code, "arrage") : "");

    await ctx.reply(text);
  });
}
