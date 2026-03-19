// src/bot/commands/support.command.js
import { lanhuage } from "../locales/index.js";
import { getUserStatus } from "../../services/user/user.service.js";
import { upgradeToPro } from "../../integrations/private/access-policy.js";

const ADMIN_ID = Number(process.env.ADMIN_ID);

// пользователи в режиме написания обращения
const supportSessions = new Set();

// админ в режиме ответа
const adminReplySessions = new Map(); // adminId -> userId

export function upgradeToProCommand(bot) {
  // вход в режим поддержки
  bot.command("upgradetopro", async (ctx) => {
    if (ctx.from.id == ADMIN_ID) {
      supportSessions.add(ctx.from.id);

      await ctx.reply(lanhuage(ctx.from.language_code, "admin_enter"));
    }
  });

  // отмена пользователем
  bot.command("cancel", async (ctx) => {
    supportSessions.delete(ctx.from.id);
    await ctx.reply(lanhuage(ctx.from.language_code, "support_canceled"));
  });

  // 📩 пользователь отправляет сообщение
  bot.on("text", async (ctx, next) => {
    const userId = ctx.from.id;

    // если это админ в режиме ответа — обрабатываем ниже
    if (ctx.from.id === ADMIN_ID && adminReplySessions.has(ADMIN_ID)) {
      return next();
    }

    if (!supportSessions.has(userId)) {
      return next();
    }

    supportSessions.delete(userId);

    const user_id = ctx.message.text;

    const status = await getUserStatus(user_id);

    if (!status) {
      await ctx.telegram.sendMessage(
        ADMIN_ID,
        lanhuage(ctx.from.language_code, "no_user"),
      );
      return;
    }

    const result = await upgradeToPro(user_id);
    const formatted = `
    👤 <b>User:</b> @${result.name || "NO username"}
    🆔 <b>ID:</b> ${result.telegram_id}
    📛 <b>Name:</b> ${result.first_name}

    <b>${lanhuage(ctx.from.language_code, "subscribe_status")}: PRO</b>\n
    <b>${result.subscription_end}</b>
    `;

    await ctx.telegram.sendMessage(
      user_id,
      `📩 <b>${lanhuage(
        ctx.from.language_code,
        "subscribe_upgrade_to_pro",
      )}</b>` + formatted,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: lanhuage(ctx.from.language_code, "support_answer"),
                callback_data: `support_reply:${result.telegram_id}`,
              },
            ],
          ],
        },
      },
    );

    await ctx.reply("<b>✅DONE</b>" + formatted, {
      parse_mode: "HTML",
    });
  });

  // 💬 админ нажал "Ответить"
  bot.action(/support_reply:(\d+)/, async (ctx) => {
    if (ctx.from.id !== ADMIN_ID) {
      return ctx.answerCbQuery(
        lanhuage(ctx.from.language_code, "support_no_rules"),
      );
    }

    const userId = Number(ctx.match[1]);

    adminReplySessions.set(ADMIN_ID, userId);

    await ctx.answerCbQuery();
    await ctx.reply(lanhuage(ctx.from.language_code, "support_enter_answer"));
  });

  // ✍️ админ отправляет ответ
  bot.on("text", async (ctx, next) => {
    if (ctx.from.id !== ADMIN_ID) {
      return next();
    }

    if (!adminReplySessions.has(ADMIN_ID)) {
      return next();
    }

    const userId = adminReplySessions.get(ADMIN_ID);
    const message = ctx.message.text;

    await ctx.telegram.sendMessage(
      userId,
      `📩 <b>${lanhuage(
        ctx.from.language_code,
        "support_answer_support",
      )}</b>\n\n${message}`,
      { parse_mode: "HTML" },
    );

    await ctx.reply(lanhuage(ctx.from.language_code, "support_answered_user"));

    adminReplySessions.delete(ADMIN_ID);
  });
}
