// src/app/index.js
import { connectRedis } from "../redis/redis.client.js";

// Функция для ленивого запуска
async function runBootstrapAndRuntime() {
  const { bootstrapApp } = await import("./bootstrap.js");
  await bootstrapApp();

  const { startRuntime } = await import("./runtime.js");
  await startRuntime();
}

export async function startApplication() {
  // Сначала подключаем Redis и очищаем кэш, если нужно
  await connectRedis();

  // Теперь можно запускать bootstrap и runtime
  await runBootstrapAndRuntime();
}
