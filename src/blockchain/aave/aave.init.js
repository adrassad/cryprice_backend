// src/blockchain/aave/aave.init.js
import { ethers } from 'ethers';
import { provider } from '../provider.js';
import { ENV } from '../../config/env.js';

// Контракт AddressesProvider
const ADDRESSES_PROVIDER_ABI = [
  'function getPool() view returns (address)',
  'function getPriceOracle() view returns (address)',
  'function getPoolDataProvider() view returns (address)'
];

// Контракт Pool (для списка резервов)
const POOL_ABI = [
  'function getReservesList() view returns (address[])'
];

export async function initAave() {
  // Инициализация AddressesProvider
  const addressesProvider = new ethers.Contract(
    ENV.AAVE_ADDRESSES_PROVIDER,
    ADDRESSES_PROVIDER_ABI,
    provider
  );

  // Получаем адреса
  const poolAddress = await addressesProvider.getPool();
  const oracleAddress = await addressesProvider.getPriceOracle();
  const dataProviderAddress = await addressesProvider.getPoolDataProvider();

  console.log('✅ poolAddress: ', poolAddress);
  console.log('✅ oracleAddress: ', oracleAddress);
  console.log('✅ dataProviderAddress: ', dataProviderAddress);
  console.log('✅ POOL_ABI: ', POOL_ABI);

  // Инициализация Pool (для получения списка резервов)
  const pool = new ethers.Contract(poolAddress, POOL_ABI, provider);

  return {
    pool,                // для списка резервов
    oracleAddress,       // для получения цен через oracle
    dataProviderAddress  // для вызова getUserReservesData(userAddress)
  };
}
