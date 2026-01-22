// src/blockchain/protocols/aave/abi/aave.abis.js

export const ADDRESSES_PROVIDER_ABI = [
  "function getPool() view returns (address)",
  "function getPriceOracle() view returns (address)",
  "function getPoolDataProvider() view returns (address)",
];

export const AAVE_POOL_ABI = [
  "function getReservesList() view returns (address[])",
  "function getUserAccountData(address user) view returns (" +
    "uint256 totalCollateralBase," +
    "uint256 totalDebtBase," +
    "uint256 availableBorrowsBase," +
    "uint256 currentLiquidationThreshold," +
    "uint256 ltv," +
    "uint256 healthFactor" +
    ")",
];

export const AAVE_DATA_PROVIDER_ABI = [
  "function getUserReserveData(address asset, address user) view returns (" +
    "uint256 currentATokenBalance," +
    "uint256 currentStableDebt," +
    "uint256 currentVariableDebt," +
    "uint256 principalStableDebt," +
    "uint256 scaledVariableDebt," +
    "uint256 stableBorrowRate," +
    "uint256 liquidityRate," +
    "uint40 stableRateLastUpdated," +
    "bool usageAsCollateralEnabled" +
    ")",
];

export const AAVE_ORACLE_ABI = [
  "function getAssetPrice(address asset) view returns (uint256)",
  "function BASE_CURRENCY() view returns (address)",
];

export const ERC20_ABI = [
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
];
