import { Scenes, Markup } from "telegraf";
import { SCENES } from "../constants/scenes.js";
import { lanhuage } from "../locales/index.js";

const ADMIN_ID = process.env.ADMIN_ID; // твой telegram id

const supportScene = new Scenes.BaseScene(SCENES.SUPPORT);

supportScene.enter(async (ctx) => {
  await ctx.reply(lanhuage(ctx.from.language_code, "support_write_message"));
});

supportScene.on("text", async (ctx) => {
  const message = ctx.message.text;
  const user = ctx.from;

  const formattedMessage = `
${lanhuage(ctx.from.language_code, "support_new_message")}

👤 User: ${user.username || "NO username"}
🆔 ID: ${user.id}
${lanhuage(ctx.from.language_code, "support_name_user")} ${user.first_name}

${lanhuage(ctx.from.language_code, "support_message")}
${message}
`;

  try {
    await ctx.telegram.sendMessage(ADMIN_ID, formattedMessage);

    await ctx.reply(lanhuage(ctx.from.language_code, "support_message_sent"));
    await ctx.scene.leave();
  } catch (error) {
    await ctx.reply(lanhuage(ctx.from.language_code, "support_message_error"));
  }
});

supportScene.command("cancel", async (ctx) => {
  await ctx.reply(lanhuage(ctx.from.language_code, "support_message_cancel"));
  await ctx.scene.leave();
});

module.exports = supportScene;
