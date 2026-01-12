import { startServer } from './api/server.js';
import { initAave } from './blockchain/aave/aave.init.js';
import { createOracle } from './blockchain/aave/aave.oracle.js';
import { loadAssets, loadAssetsToCache } from './services/asset.service.js';
import { startPriceUpdater } from './cron/priceUpdater.js';
import { ERC20_ABI } from './blockchain/erc20.js';
import { provider } from './blockchain/provider.js';
import { startBot } from './bot/bot.js';
import { ethers } from 'ethers';
import { initDb } from './db/init.js';

await initDb();


async function bootstrap() {
  try {
    console.log('⏳ Initializing Aave...');

    const { pool, oracleAddress } = await initAave();
    const oracle = createOracle(oracleAddress);

    // load reserves
    const reserves = await pool.getReservesList();
    console.log('reserves: ',reserves);
    const assets = [];
    for (const address of reserves) {
      try {
        const token = new ethers.Contract(address, ERC20_ABI, provider);
        const [symbol, decimals] = await Promise.all([
          token.symbol(),
          token.decimals()
        ]);
        assets.push({ symbol, address, decimals: Number(decimals) });
      } catch {}
    }
    console.log('assets',assets);
    await loadAssets(assets);
    await loadAssetsToCache();
    console.log(`✅ Loaded ${assets.length} assets`);

    startPriceUpdater(oracle);
    startServer();
    startBot();


  } catch (e) {
    console.error('❌ Failed to start:', e);
    process.exit(1);
  }
}

bootstrap();
