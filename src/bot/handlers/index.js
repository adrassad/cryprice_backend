//src/bot/handlers/index.js
import { upgradeHandler } from "./upgrade.handler.js";
import { walletAddHears } from "./walletAdd.handler.js";
import { walletDeleteHandler } from "./walletDelete.handler.js";
import { walletRemoveHandler } from "./walletRemove.handler.js";
import { registerGlobalErrorHandler } from "./error.handler.js";

export function registerHandlers(bot) {
  upgradeHandler(bot);
  walletAddHears(bot);
  walletRemoveHandler(bot);
  walletDeleteHandler(bot);
  registerGlobalErrorHandler(bot);
}
