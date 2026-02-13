// src/bot/bot.instance.js
let botInstance = null;

export function setBot(bot) {
  botInstance = bot;
}

export function getBot() {
  if (!botInstance) {
    throw new Error("Bot not initialized");
  }
  return botInstance;
}
