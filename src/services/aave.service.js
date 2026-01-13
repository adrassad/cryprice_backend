//src/services/aave.service.js
import { getUserAavePositions } from '../blockchain/aave/aave.dataProvider.js';
import { getAssetPriceUSD } from './price.service.js';
import { getAssetByAddress } from './asset.service.js';

export async function getWalletPositions(walletAddress) {
  const { positions, healthFactor } = await getUserAavePositions(walletAddress);

  const supplies = [];
  const borrows = [];
  const totals = [];

  let totalSuppliedUsd = 0;
  let totalBorrowedUsd = 0;

  for (const r of positions) {
    const asset = await getAssetByAddress(r.asset);
    if (!asset) continue;

    const decimals = asset.decimals;
    const priceUSD = await getAssetPriceUSD(r.asset);
    //console.log('asset, priceUSD: ', r.asset, priceUSD)
    if (r.aTokenBalance > 0n) {
      const amount = Number(r.aTokenBalance) / 10 ** decimals;
      const usd = amount * priceUSD;
      supplies.push({
        symbol: asset.symbol,
        amount,
        usd: usd,
        collateral: r.collateral
      });
      totalSuppliedUsd += usd;
    }

    if (r.variableDebt > 0n || r.stableDebt > 0n) {
      const debt =
        Number(r.variableDebt + r.stableDebt) / 10 ** decimals;
      const usd = debt * priceUSD;
      borrows.push({
        symbol: asset.symbol,
        amount: debt,
        usd: usd
      });
      totalBorrowedUsd += usd;
    }

    totals.push( {
      suppliedUsd: totalSuppliedUsd,
      borrowedUsd: totalBorrowedUsd,
      netUsd: totalSuppliedUsd - totalBorrowedUsd
    });

  }

  //console.log('borrows: ',borrows);

  return { supplies, borrows, totals, healthFactor};
}
