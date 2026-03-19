//src/bot/commands/index.js
import { startCommand } from "./start.command.js";
import { helpCommand } from "./help.command.js";
import { statusCommand } from "./status.command.js";
import { positionsCommand } from "./positions.command.js";
import { healthFactorCommand } from "./healthfactor.command.js";

export function registerCommands(bot) {
  startCommand(bot);
  helpCommand(bot);
  statusCommand(bot);
  positionsCommand(bot);
  healthFactorCommand(bot);
}
