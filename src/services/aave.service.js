import { getUserAavePositions } from '../blockchain/aave/aave.dataProvider.js';
import { getAssetPriceUSD } from './price.service.js';
import { getAssetByAddress } from './asset.service.js';

export async function getWalletPositions(walletAddress) {
  const reserves = await getUserAavePositions(walletAddress);

  const supplies = [];
  const borrows = [];

  for (const r of reserves) {
    const asset = await getAssetByAddress(r.asset);
    if (!asset) continue;

    const decimals = asset.decimals;
    const priceUSD = await getAssetPriceUSD(r.asset);
    //console.log('asset, priceUSD: ', r.asset, priceUSD)
    if (r.aTokenBalance > 0n) {
      const amount = Number(r.aTokenBalance) / 10 ** decimals;

      supplies.push({
        symbol: asset.symbol,
        amount,
        usd: amount * priceUSD,
        collateral: r.collateral
      });
    }

    if (r.variableDebt > 0n || r.stableDebt > 0n) {
      const debt =
        Number(r.variableDebt + r.stableDebt) / 10 ** decimals;

      borrows.push({
        symbol: asset.symbol,
        amount: debt,
        usd: debt * priceUSD
      });
    }
  }

  console.log('borrows: ',borrows);

  return { supplies, borrows };
}
