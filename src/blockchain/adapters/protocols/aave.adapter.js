//src/blockchain/adapters/protocols/aave.adapter.js
import { Contract } from "ethers";
import { BaseProtocol } from "../../protocols/base.protocol.js";
import {
  ADDRESSES_PROVIDER_ABI,
  AAVE_POOL_ABI,
  AAVE_ORACLE_ABI,
} from "../../protocols/aave/abi/aave.abis.js";
import { ERC20_STRING_ABI, ERC20_BYTES32_ABI } from "../../abi/index.js";
import { getTokenMetadata } from "../../helpers/tokenMetadata.js";
import { isAddress } from "ethers";

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
      //console.log("getOracle oracleAddress", oracleAddress);
      this.oracle = new Contract(oracleAddress, AAVE_ORACLE_ABI, this.provider);
      //this.baseCurrencyDecimals = await this.oracle.BASE_CURRENCY_DECIMALS();
    }
    return this.oracle;
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
    // console.log("getPrices prices", prices);
    return prices;
  }

  async getUserPositions(userAddress) {
    const pool = await this.getPool();
    return pool.getUserPositions(userAddress);
  }
}
