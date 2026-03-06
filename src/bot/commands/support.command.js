// src/bot/commands/support.command.js
import { lanhuage } from "../locales/index.js";

const ADMIN_ID = Number(process.env.ADMIN_ID);

// пользователи в режиме написания обращения
const supportSessions = new Set();

// админ в режиме ответа
const adminReplySessions = new Map(); // adminId -> userId

export function supportCommand(bot) {
  // вход в режим поддержки
  bot.command("support", async (ctx) => {
    supportSessions.add(ctx.from.id);

    await ctx.reply(lanhuage(ctx.from.language_code, "support_enter"));
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

    const user = ctx.from;
    const message = ctx.message.text;

    const formatted = `
📩 <b>${lanhuage(ctx.from.language_code, "support_sent_title")}</b>

👤 <b>User:</b> @${user.username || "NO username"}
🆔 <b>ID:</b> ${user.id}
📛 <b>Имя:</b> ${user.first_name}

💬 <b>${lanhuage(ctx.from.language_code, "message")}</b>
${message}
`;

    await ctx.telegram.sendMessage(ADMIN_ID, formatted, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: lanhuage(ctx.from.language_code, "support_answer"),
              callback_data: `support_reply:${user.id}`,
            },
          ],
        ],
      },
    });

    await ctx.reply(
      lanhuage(ctx.from.language_code, "support_answered_support"),
    );
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
