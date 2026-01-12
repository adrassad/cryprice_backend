// src/cron/priceUpdater.js
import cron from 'node-cron';
import { ASSETS_CACHE } from '../cache/memory.cache.js';
import { savePrice } from '../services/price.service.js';
import { formatUnits } from 'ethers';

export function startPriceUpdater(oracle) {
  cron.schedule('* * * * *', async () => {
    console.log('⏱ Updating prices...');
    for (const address in ASSETS_CACHE) {
      const asset = ASSETS_CACHE[address];

      try {
        const priceBig = await oracle.getAssetPrice(address);

        if (!priceBig || priceBig == 0n) {
          console.warn(`Price not available for ${asset.symbol} (${address})`);
          continue;
        }

        // Aave oracle → 8 decimals
        const priceUsd = Number(formatUnits(priceBig, 8));

        await savePrice(address, priceUsd);
        //console.log(`✅ Updated price: ${asset.symbol} = ${priceUsd} USD`);
      } catch (e) {
        console.error(`Error updating ${asset.symbol} (${address}):`, e);
      }
    }
  });
}
