import { assetHandler } from './asset.handler.js';
import { priceHandler } from './price.handler.js';
import { upgradeHandler } from './upgrade.handler.js';
import { walletAddHandler } from './walletAdd.handler.js';
import { walletRemoveHandler } from './walletRemove.handler.js';

export function registerHandlers(bot) {
  assetHandler(bot);
  priceHandler(bot);
  upgradeHandler(bot);
  walletAddHandler(bot);
  walletRemoveHandler(bot);
}
