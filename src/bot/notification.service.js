// src/bot/notification.service.js
import { getBot } from "./bot.instance.js";

export const NotificationService = {
  async sendToUser(telegramId, message, extra = {}) {
    try {
      const bot = getBot();
      await bot.telegram.sendMessage(telegramId, message, extra);
    } catch (err) {
      console.error(`⚠️ Failed to send message to ${telegramId}:`, err.message);
    }
  },
};
