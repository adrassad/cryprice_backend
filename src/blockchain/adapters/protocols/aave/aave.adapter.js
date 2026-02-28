//
import { Contract, getAddress, isAddress } from "ethers";
import { AaveBaseAdapter } from "../base.protocol.js";
import { getTokenMetadata } from "../../../helpers/tokenMetadata.js";
import { parseHealthFactor } from "../../../helpers/healthFactor.js";

export class AaveAdapter extends AaveBaseAdapter {
  constructor({ provider, config, AbiRegistry, networkName }) {
    super({ provider, config });

    this.AbiRegistry = AbiRegistry;
    this.networkName = networkName;

    if (!config.ADDRESSES_PROVIDER) {
      throw new Error("Aave ADDRESSES_PROVIDER not configured");
    }

    this.addressesProviderAddress = getAddress(config.ADDRESSES_PROVIDER);
  }

  /**
   * lazy init addresses provider
   */
  async getAddressesProvider() {
    if (!this.addressesProvider) {
      const abi = await this.AbiRegistry.get(
        this.networkName,
        this.addressesProviderAddress.toLowerCase(),
        "aave",
      );

      this.addressesProvider = new Contract(
        this.addressesProviderAddress,
        abi,
        this.provider,
      );
    }

    return this.addressesProvider;
  }

  async getPool() {
    if (!this.pool) {
      const provider = await this.getAddressesProvider();

      const poolAddress = await provider.getPoolDataProvider();

      const abi = await this.AbiRegistry.get(
        this.networkName,
        poolAddress.toLowerCase(),
        "aave",
      );

      this.pool = new Contract(poolAddress, abi, this.provider);
    }

    return this.pool;
  }

  async getOracle() {
    if (!this.oracle) {
      const provider = await this.getAddressesProvider();

      const oracleAddress = await provider.getPriceOracle();

      const abi = await this.AbiRegistry.get(
        this.networkName,
        oracleAddress.toLowerCase(),
        "aave",
      );

      this.oracle = new Contract(oracleAddress, abi, this.provider);
    }

    return this.oracle;
  }

  async getDataProvider() {
    if (!this.dataProvider) {
      const provider = await this.getAddressesProvider();

      const address = await provider.getPoolDataProvider();

      const abi = await this.AbiRegistry.get(
        this.networkName,
        address.toLowerCase(),
        "aave",
      );

      this.dataProvider = new Contract(address, abi, this.provider);
    }

    return this.dataProvider;
  }

  async getAssets() {
    const pool = await this.getPool();

    // const reserves = await pool.getReservesList();
    const reserves = await pool.getAllReservesTokens();

    const assets = await Promise.all(
      reserves.map((reserve) =>
        getTokenMetadata(reserve[1], this.provider).catch(() => null),
      ),
    );

    return assets.filter(Boolean);
  }

  async getPrices(assets) {
    const ORACLE_DECIMALS = 8;

    const oracle = await this.getOracle();

    const prices = {};

    // отфильтровать и нормализовать адреса
    const validAssets = assets.filter((a) => a.address && isAddress(a.address));

    if (!validAssets.length) {
      return prices;
    }

    const addresses = validAssets.map((a) => a.address);

    try {
      // один вызов вместо множества
      const rawPrices = await oracle.getAssetsPrices(addresses);

      rawPrices.forEach((rawPrice, index) => {
        if (!rawPrice || rawPrice === 0n) return;

        const asset = validAssets[index];
        const addressLower = asset.address.toLowerCase();

        prices[addressLower] = {
          address: asset.address,
          symbol: asset.symbol,
          price: Number(rawPrice) / 10 ** ORACLE_DECIMALS,
        };
      });
    } catch (e) {
      console.error("Batch price fetch failed:", e.message);
    }

    return prices;
  }

  async getUserHealthFactor(userAddress) {
    try {
      const provider = await this.getAddressesProvider();
      const proxiPoolAddress = await provider.getPool();

      const abi = [
        "function getUserAccountData(address user) view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)",
      ];

      const pool = new Contract(proxiPoolAddress, abi, this.provider);

      const { healthFactor } = await pool.getUserAccountData(userAddress);

      return parseHealthFactor(healthFactor);
    } catch (e) {
      console.warn("getUserHealthFactor failed", e.message);

      return null;
    }
  }

  async getUserPositions(userAddress) {
    console.log("getUserPositions chain:", this.networkName);
    const healthFactor = await this.getUserHealthFactor(userAddress);

    try {
      const uiAddress = getAddress(this.config.DATA_PROVIDER);

      const abi = await this.AbiRegistry.get(
        this.networkName,
        uiAddress.toLowerCase(),
        "aave",
      );

      const ui = new Contract(uiAddress, abi, this.provider);

      const [userReserves] = await ui.getUserReservesData(
        this.addressesProviderAddress,
        userAddress,
      );

      const positions = parseUserPositions(userReserves);

      return {
        positions,
        healthFactor,
        error: null,
      };
    } catch (e) {
      return {
        positions: [],
        healthFactor,
        error: e.message,
      };
    }
  }
}

export function parseUserPositions(userReserves) {
  console.log("userReserves: ", userReserves);
  return userReserves
    .filter(
      (r) =>
        r.underlyingAsset !== "0x0000000000000000000000000000000000000000" &&
        (r.scaledATokenBalance > 0n ||
          r.principalStableDebt > 0n ||
          r.scaledVariableDebt > 0n),
    )
    .map((r) => ({
      assetAddress: r?.underlyingAsset ?? null,
      aTokenBalance: toBigIntSafe(r?.scaledATokenBalance),
      stableDebt: toBigIntSafe(r?.principalStableDebt),
      variableDebt: toBigIntSafe(r?.scaledVariableDebt),
      collateral: toBoolSafe(r?.usageAsCollateralEnabledOnUser),
      stableBorrowRate: toBigIntSafe(r?.stableBorrowRate),
      stableBorrowLastUpdateTimestamp: toNumberSafe(
        r?.stableBorrowLastUpdateTimestamp,
      ),
    }));
}

function toBigIntSafe(value) {
  if (value === undefined || value === null) return 0n;

  try {
    return BigInt(value);
  } catch {
    return 0n;
  }
}

function toBoolSafe(value) {
  return Boolean(value);
}

function toNumberSafe(value) {
  if (value === undefined || value === null) return 0;
  return Number(value);
}
