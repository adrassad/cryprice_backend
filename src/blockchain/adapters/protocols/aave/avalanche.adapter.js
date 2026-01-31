import { Contract, getAddress, isAddress } from "ethers";
import { AaveBaseAdapter } from "../base.protocol.js";

import {
  AAVE_POOL_V3_ABI,
  AAVE_ORACLE_ABI,
  POOL_ADDRESSES_PROVIDER_V3_ABI,
  UI_POOL_DATA_PROVIDER_V3_ABI,
} from "../../../protocols/aave/abi/aave.abis.js";

import { getTokenMetadata } from "../../../helpers/tokenMetadata.js";

const STATIC = {
  POOL_ADDRESSES_PROVIDER: getAddress(
    "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
  ),
  ORACLE: getAddress("0xEBd36016B3eD09D4693Ed4251c67Bd858c3c7C9C"),
  UI_POOL_DATA_PROVIDER: getAddress(
    "0x50B4a66bF4D41e6252540eA7427D7A933Bc3c088",
  ),
};

export const RAY = 10n ** 27n;
export class AaveAvalancheAdapter extends AaveBaseAdapter {
  constructor({ provider, config }) {
    super({ provider, config });

    this.provider = provider;

    this.poolAddressesProvider = new Contract(
      STATIC.POOL_ADDRESSES_PROVIDER,
      POOL_ADDRESSES_PROVIDER_V3_ABI,
      provider,
    );

    this.oracle = new Contract(STATIC.ORACLE, AAVE_ORACLE_ABI, provider);

    this.uiDataProvider = new Contract(
      STATIC.UI_POOL_DATA_PROVIDER,
      UI_POOL_DATA_PROVIDER_V3_ABI,
      provider,
    );

    this.pool = null;
  }

  async ensureAvalanche() {
    const { chainId } = await this.provider.getNetwork();
    if (Number(chainId) !== 43114) {
      throw new Error("Not Avalanche RPC");
    }

    if (!this.pool) {
      const poolAddress = await this.poolAddressesProvider.getPool();
      console.log("poolAddress: ", poolAddress);
      this.pool = new Contract(poolAddress, AAVE_POOL_V3_ABI, this.provider);
    }
  }

  async getAssets() {
    await this.ensureAvalanche();

    const reserves = await this.pool.getReservesList();

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

  async getUserPositions(userAddress) {
    await this.ensureAvalanche();

    // Получаем данные пользователя
    const [userReserves, userEModeCategoryId] =
      await this.uiDataProvider.getUserReservesData(
        STATIC.POOL_ADDRESSES_PROVIDER,
        userAddress,
      );

    // Получаем healthFactor напрямую
    const { healthFactor } = await this.pool.getUserAccountData(userAddress);

    // Ray = 1e27
    const RAY = 10n ** 27n;

    const positions = userReserves
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

    return {
      positions,
      healthFactor: Number(healthFactor ?? 0n) / 1e18,
    };
  }
}
