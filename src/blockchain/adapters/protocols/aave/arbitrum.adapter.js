// src/blockchain/adapters/protocols/aave/arbitrum.adapter.js
import { Contract, getAddress, isAddress } from "ethers";
import { AaveBaseAdapter } from "../base.protocol.js";
import { Aave } from "../../../abi/index.js";
import { getTokenMetadata } from "../../../helpers/tokenMetadata.js";
import { parseHealthFactor } from "../../../helpers/healthFactor.js";

export class AaveArbitrumAdapter extends AaveBaseAdapter {
  constructor({ provider, config }) {
    super({ provider, config });

    if (!config.ADDRESSES_PROVIDER) {
      throw new Error("Aave ADDRESSES_PROVIDER not configured");
    }

    const correctAddress = getAddress(config.ADDRESSES_PROVIDER);
    this.addressesProvider = new Contract(
      correctAddress,
      Aave.PoolAddressesProviderV3.POOL_ADDRESSES_PROVIDER_V3_ABI,
      provider,
    );
  }

  async getPool() {
    if (!this.pool) {
      const poolAddress = await this.addressesProvider.getPool();
      this.pool = new Contract(
        poolAddress,
        Aave.AavePoolV3.AAVE_POOL_V3_ABI,
        this.provider,
      );
    }
    return this.pool;
  }

  async getOracle() {
    if (!this.oracle) {
      const oracleAddress = await this.addressesProvider.getPriceOracle();
      this.oracle = new Contract(
        oracleAddress,
        Aave.Oracle.AAVE_ORACLE_ABI,
        this.provider,
      );
    }
    return this.oracle;
  }

  async getDataProvider() {
    if (!this.dataProvider) {
      const address = await this.addressesProvider.getPoolDataProvider();
      this.dataProvider = new Contract(
        address,
        Aave.DataProvider.AAVE_DATA_PROVIDER_ABI,
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
    return prices;
  }

  async getUserHealthFactor(userAddress) {
    try {
      const pool = await this.getPool();
      const { healthFactor } = await pool.getUserAccountData(userAddress);
      return parseHealthFactor(healthFactor);
    } catch (e) {
      console.warn("⚠️ getUserHealthFactor failed: ", userAddress, e.message);
      return "0.0000";
    }
  }

  async getUserPositions(userAddress) {
    const healthFactor = await this.getUserHealthFactor(userAddress);
    try {
      const uiAddress = getAddress(this.config.DATA_PROVIDER);
      const ui = new Contract(
        uiAddress,
        Aave.DataProvider.AAVE_DATA_PROVIDER_ABI_ARB,
        this.provider,
      );

      const [userReserves, userEmodeCategoryId] = await ui.getUserReservesData(
        this.addressesProvider.target,
        userAddress,
      );

      const positions = parseUserPositions(userReserves);

      return {
        positions,
        healthFactor: healthFactor,
        error: null,
      };
    } catch (e) {
      return {
        positions: [],
        healthFactor: healthFactor,
        error: e.message,
      };
    }
  }
}

export async function parseUserPositions(userReserves) {
  // фильтруем реально существующие позиции и сразу возвращаем массив
  return userReserves
    .filter(
      (r) =>
        r.underlyingAsset !== "0x0000000000000000000000000000000000000000" &&
        (r.scaledATokenBalance > 0n ||
          r.principalStableDebt > 0n ||
          r.scaledVariableDebt > 0n),
    )
    .map((r) => ({
      assetAddress: r.underlyingAsset,
      aTokenBalance: r.scaledATokenBalance,
      stableDebt: r.principalStableDebt,
      variableDebt: r.scaledVariableDebt,
      collateral: r.usageAsCollateralEnabledOnUser,
      stableBorrowRate: r.stableBorrowRate,
      stableBorrowLastUpdateTimestamp: r.stableBorrowLastUpdateTimestamp,
    }));
}
