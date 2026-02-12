import { Telegraf, Scenes, session } from "telegraf";
import { ENV } from "../config/env.js";
import { addWalletScene } from "./scenes/addWallet.scene.js";
import { registerHandlers } from "./handlers/index.js";
import { registerCommands } from "./commands/index.js";
import { removeWalletScene } from "./scenes/removeWallet.scene.js";

export function startBot() {
  const bot = new Telegraf(ENV.BOT_TOKEN);

  const stage = new Scenes.Stage([addWalletScene, removeWalletScene]);

  bot.use(session());
  bot.use(stage.middleware());

  registerCommands(bot);
  registerHandlers(bot);

  bot.launch();
  console.log("🤖 Telegram bot started");

  return bot;
}
