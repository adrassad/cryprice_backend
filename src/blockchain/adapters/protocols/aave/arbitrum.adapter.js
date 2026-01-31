// src/blockchain/adapters/protocols/aave/arbitrum.adapter.js
import { Contract, getAddress } from "ethers";
import { AaveBaseAdapter } from "../base.protocol.js";
import {
  ADDRESSES_PROVIDER_ABI,
  AAVE_POOL_ABI,
  AAVE_ORACLE_ABI,
  AAVE_DATA_PROVIDER_ABI,
} from "../../../protocols/aave/abi/aave.abis.js";
import { getTokenMetadata } from "../../../helpers/tokenMetadata.js";
import { isAddress } from "ethers";

export class AaveArbitrumAdapter extends AaveBaseAdapter {
  constructor({ provider, config }) {
    super({ provider, config });

    if (!config.ADDRESSES_PROVIDER) {
      throw new Error("Aave ADDRESSES_PROVIDER not configured");
    }

    const correctAddress = getAddress(config.ADDRESSES_PROVIDER);
    //console.log("correctAddress: ", correctAddress);
    this.addressesProvider = new Contract(
      correctAddress,
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
      //console.log("getOracle oracleAddress", oracleAddress);
      this.oracle = new Contract(oracleAddress, AAVE_ORACLE_ABI, this.provider);
      //this.baseCurrencyDecimals = await this.oracle.BASE_CURRENCY_DECIMALS();
    }
    return this.oracle;
  }

  async getDataProvider() {
    if (!this.dataProvider) {
      const address = await this.addressesProvider.getPoolDataProvider();
      this.dataProvider = new Contract(
        address,
        AAVE_DATA_PROVIDER_ABI,
        this.provider,
      );
    }
    return this.dataProvider;
  }

  async getAssets() {
    const pool = await this.getPool();
    const reserves = await pool.getReservesList();

    const assets = await Promise.all(
      reserves.map((address) =>
        getTokenMetadata(address, this.provider).catch(() => null),
      ),
    );
    // ❗️отсекаем битые токены
    return assets.filter(Boolean);
  }

  async getPrices(assets) {
    //console.log("ARBITRUM getPrices: ");
    const ORACLE_DECIMALS = 8;
    const oracle = await this.getOracle();

    const prices = {};

    // ⚡ параллельные запросы
    await Promise.all(
      assets.map(async (asset) => {
        const { address, symbol } = asset;

        // 🛡 защита
        if (!address || !isAddress(address)) {
          console.warn("Invalid address:", address);
          return;
        }

        try {
          const rawPrice = await oracle.getAssetPrice(address);

          // иногда oracle возвращает 0 — это не ошибка
          if (!rawPrice || rawPrice === 0n) return;

          prices[address.toLowerCase()] = {
            address,
            symbol,
            price: Number(rawPrice) / 10 ** ORACLE_DECIMALS,
          };
        } catch (e) {
          console.warn(
            `⚠️ Price fetch failed for ${symbol} (${address}):`,
            e.shortMessage || e.message,
          );
        }
      }),
    );
    // console.log("getPrices prices", prices);
    return prices;
  }

  async getUserPositions(userAddress) {
    const dataProvider = await this.getDataProvider();
    const pool = await this.getPool();
    const reserves = await pool.getReservesList();
    const positions = [];

    await Promise.all(
      reserves.map(async (asset) => {
        try {
          const data = await dataProvider.getUserReserveData(
            asset,
            userAddress,
          );
          //console.log("getUserPositions data: ", data);
          const [
            aTokenBalance,
            stableDebt,
            variableDebt,
            ,
            ,
            ,
            ,
            ,
            collateral,
          ] = data;

          // если нет позиции — пропускаем
          if (
            aTokenBalance === 0n &&
            stableDebt === 0n &&
            variableDebt === 0n
          ) {
            return;
          }
          //const dataAsset = await getTokenMetadata(asset, this.provider);
          positions.push({
            assetAddress: asset,
            aTokenBalance,
            stableDebt,
            variableDebt,
            collateral,
          });
        } catch (e) {
          console.warn("Reserve read failed:", asset);
        }
      }),
    );

    // 🔹 healthFactor берём из Pool
    const { healthFactor } = await pool.getUserAccountData(userAddress);

    return {
      positions,
      healthFactor: Number(healthFactor) / 1e18,
    };
  }
}
