// src/app/runtime.js
import { startCrons } from "../cron/index.js";
import { startBot } from "../bot/bot.js";
import { startServer } from "../api/server.js";

export async function startRuntime() {
  //startCrons();
  startBot();
  //startServer();
}
