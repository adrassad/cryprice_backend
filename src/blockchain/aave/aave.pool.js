import { initAave } from './aave.init.js';

export async function getUserAccountData(address) {
  const { pool } = await initAave();
  return pool.getUserAccountData(address);
}
