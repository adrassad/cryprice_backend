// src/blockchain/aave/aave.dataProvider.js
import { ethers } from 'ethers';
import { provider } from '../provider.js';
import { initAave } from './aave.init.js';

export async function getUserAavePositions(userAddress) {
  const { pool, dataProviderAddress } = await initAave();

  // ABI для AaveProtocolDataProvider
  const DATA_PROVIDER_ABI = [
    'function getUserReserveData(address asset, address user) view returns (' +
    'uint256 currentATokenBalance,' +
    'uint256 currentStableDebt,' +
    'uint256 currentVariableDebt,' +
    'uint256 principalStableDebt,' +
    'uint256 scaledVariableDebt,' +
    'uint256 stableBorrowRate,' +
    'uint256 liquidityRate,' +
    'uint40 stableRateLastUpdated,' +
    'bool usageAsCollateralEnabled' +
    ')'
  ];

  const dataProvider = new ethers.Contract(
    dataProviderAddress,
    DATA_PROVIDER_ABI,
    provider
  );

  // Получаем список всех активов в пуле
  const reservesList = await pool.getReservesList();

  const positions = [];

  for (const asset of reservesList) {
    const data = await dataProvider.getUserReserveData(asset, userAddress);
    const [
      aTokenBalance,
      stableDebt,
      variableDebt,
      principalStableDebt,
      scaledVariableDebt,
      stableBorrowRate,
      liquidityRate,
      stableRateLastUpdated,
      usageAsCollateralEnabled
    ] = data;

    const supplied = BigInt(aTokenBalance);
    const borrowed = BigInt(variableDebt) + BigInt(principalStableDebt);

    if (supplied > 0n || borrowed > 0n) {
      positions.push({
        asset,
        supplied: supplied > 0n,
        borrowed: borrowed > 0n,
        collateral: usageAsCollateralEnabled,
        aTokenBalance: supplied,
        variableDebt: BigInt(variableDebt),
        stableDebt: BigInt(principalStableDebt)
      });
    }
  }

  return positions;
}
