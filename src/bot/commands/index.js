import { startCommand } from './start.command.js';
import { helpCommand } from './help.command.js';

export function registerCommands(bot) {
  startCommand(bot);
  helpCommand(bot);
}
