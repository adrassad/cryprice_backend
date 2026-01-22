//src/blockchain/adapters/protocols/aave.adapter.js
import { Contract } from "ethers";
import { BaseProtocol } from "../../protocols/base.protocol.js";
import {
  ADDRESSES_PROVIDER_ABI,
  AAVE_POOL_ABI,
  ERC20_ABI,
  AAVE_ORACLE_ABI,
} from "../../protocols/aave/abi/aave.abis.js";

export class AaveAdapter extends BaseProtocol {
  constructor({ provider, config }) {
    super({ provider, config });

    if (!config.ADDRESSES_PROVIDER) {
      throw new Error("Aave ADDRESSES_PROVIDER not configured");
    }

    this.addressesProvider = new Contract(
      config.ADDRESSES_PROVIDER,
      ADDRESSES_PROVIDER_ABI,
      provider,
    );
  }

  async getPool() {
    if (!this.pool) {
      const poolAddress = await this.addressesProvider.getPool();
      this.pool = new Contract(poolAddress, AAVE_POOL_ABI, this.provider);
    }
    return this.pool;
  }

  async getOracle() {
    if (!this.oracle) {
      const oracleAddress = await this.addressesProvider.getPriceOracle();
      console.log("getOracle oracleAddress", oracleAddress);
      this.oracle = new Contract(oracleAddress, AAVE_ORACLE_ABI, this.provider);
      //this.baseCurrencyDecimals = await this.oracle.BASE_CURRENCY_DECIMALS();
    }
    return this.oracle;
  }

  async getAssets() {
    const pool = await this.getPool();
    const reserves = await pool.getReservesList();
    const result = await Promise.all(
      reserves.map(async (address) => {
        const token = new Contract(address, ERC20_ABI, this.provider);
        const [symbol, decimals] = await Promise.all([
          token.symbol(),
          token.decimals(),
        ]);
        return { address, symbol, decimals: Number(decimals) };
      }),
    );
    return result;
  }

  async getPrices(assets) {
    const ORACLE_DECIMALS = 8;
    const oracle = await this.getOracle();
    const prices = [];
    for (const address of Object.keys(assets)) {
      const rawPrice = await oracle.getAssetPrice(address);
      prices[address] = {
        address,
        price: Number(rawPrice) / 10 ** ORACLE_DECIMALS,
      };
    }
    //console.log("getPrices prices", prices);
    return prices;
  }

  async getUserPositions(userAddress) {
    const pool = await this.getPool();
    return pool.getUserPositions(userAddress);
  }
}
