import { Contract, getAddress, isAddress } from "ethers";
import { AaveBaseAdapter } from "../base.protocol.js";

import { Aave } from "../../../abi/index.js";
import { getTokenMetadata } from "../../../helpers/tokenMetadata.js";
import { parseHealthFactor } from "../../../helpers/healthFactor.js";

export const RAY = 10n ** 27n;
export class AaveAvalancheAdapter extends AaveBaseAdapter {
  constructor({ provider, config }) {
    super({ provider, config });

    this.provider = provider;

    this.poolAddressesProvider = new Contract(
      config.ADDRESSES_PROVIDER,
      Aave.PoolAddressesProviderV3.POOL_ADDRESSES_PROVIDER_V3_ABI,
      provider,
    );

    this.oracle = null;
    this.pool = null;
  }

  async ensureAvalanche() {
    const { chainId } = await this.provider.getNetwork();
    if (Number(chainId) !== 43114) {
      throw new Error("Not Avalanche RPC");
    }
  }

  async getPool() {
    if (!this.pool) {
      const poolAddress = await this.poolAddressesProvider.getPool();
      this.pool = new Contract(
        poolAddress,
        Aave.AavePoolV3.AAVE_POOL_V3_ABI,
        this.provider,
      );
    }
    return this.pool;
  }
  async getAssets() {
    await this.ensureAvalanche();

    const pool = await this.getPool();
    const reserves = await pool.getReservesList();

    const assets = await Promise.all(
      reserves.map((address) =>
        getTokenMetadata(address, this.provider).catch(() => null),
      ),
    );

    return assets.filter(Boolean);
  }

  async getPrices(assets) {
    await this.ensureAvalanche();
    const prices = {};
    const ORACLE_DECIMALS = 8;

    const oracleAddress = await this.poolAddressesProvider.getPriceOracle();

    this.oracle = new Contract(
      oracleAddress,
      Aave.Oracle.AAVE_ORACLE_ABI,
      this.provider,
    );

    for (const { address, symbol, decimals } of assets) {
      if (!isAddress(address)) continue;

      try {
        const raw = await this.oracle.getAssetPrice(address);
        if (!raw || raw === 0n) continue;

        prices[address.toLowerCase()] = {
          address,
          symbol,
          price: Number(raw) / 10 ** ORACLE_DECIMALS,
        };
      } catch {}
    }

    return prices;
  }

  async getUserHealthFactor(userAddress) {
    try {
      const pool = await this.getPool();
      const data = await pool.getUserAccountData(userAddress);

      return parseHealthFactor(data.healthFactor);
    } catch (e) {
      console.warn("⚠️ getUserHealthFactor failed:", e.message);
      return 0;
    }
  }

  async getUserPositions(userAddress) {
    await this.ensureAvalanche();
    let positions = [];

    // Получаем healthFactor напрямую
    const healthFactor = await this.getUserHealthFactor(userAddress);

    try {
      const uiDataProvider = new Contract(
        this.config.DATA_PROVIDER,
        Aave.UiPoolDataProviderV3.UI_POOL_DATA_PROVIDER_V3_ABI,
        this.provider,
      );

      // Получаем данные пользователя
      const [userReserves, userEModeCategoryId] =
        await uiDataProvider.getUserReservesData(
          this.config.ADDRESSES_PROVIDER,
          userAddress,
        );

      // Ray = 1e27
      const RAY = 10n ** 27n;

      positions = userReserves
        .filter(
          (r) =>
            (r.scaledATokenBalance ?? 0n) > 0n ||
            (r.scaledVariableDebt ?? 0n) > 0n ||
            (r.principalStableDebt ?? 0n) > 0n,
        )
        .map((r) => {
          // Безопасные значения
          const scaledATokenBalance = r.scaledATokenBalance ?? 0n;
          const scaledVariableDebt = r.scaledVariableDebt ?? 0n;
          const principalStableDebt = r.principalStableDebt ?? 0n;

          const liquidityIndex = BigInt(r.liquidityIndex ?? RAY); // если undefined, ставим 1e27
          const variableBorrowIndex = BigInt(r.variableBorrowIndex ?? RAY); // если undefined, ставим 1e27

          // Рассчитываем реальные балансы
          const aTokenBalance =
            scaledATokenBalance > 0n
              ? (scaledATokenBalance * liquidityIndex) / RAY
              : 0n;

          const variableDebt =
            scaledVariableDebt > 0n
              ? (scaledVariableDebt * variableBorrowIndex) / RAY
              : 0n;

          const stableDebt = BigInt(principalStableDebt);

          return {
            assetAddress: r.underlyingAsset,
            aTokenBalance,
            variableDebt,
            stableDebt,
            collateralEnabled: r.usageAsCollateralEnabledOnUser ?? false,
            tokenType: r.tokenType ?? null,
          };
        });
    } catch (e) {
      return {
        positions: [],
        healthFactor: healthFactor,
        error: e.message,
      };
    }
    return {
      positions,
      healthFactor: healthFactor,
      error: null,
    };
  }
}
