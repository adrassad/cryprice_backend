//src/blockchain/helpers/healthFactor.js
import { formatUnits, MaxUint256 } from "ethers";

/**
 * Универсальный форматтер Health Factor из Aave
 *
 * @param {bigint|string|number|null|undefined} rawHealthFactor
 * @param {number} decimals (по умолчанию 18 для Aave)
 * @returns {string} готовое значение для UI
 */
export function parseHealthFactor(rawHealthFactor, decimals = 18) {
  try {
    if (rawHealthFactor === null || rawHealthFactor === undefined) {
      return null;
    }

    // ethers v6 → bigint
    if (typeof rawHealthFactor === "bigint") {
      if (rawHealthFactor === MaxUint256) {
        return Infinity;
      }

      const formatted = formatUnits(rawHealthFactor, decimals);
      return Number(formatted);
    }

    if (typeof rawHealthFactor === "string") {
      const num = Number(rawHealthFactor);
      return Number.isFinite(num) ? num : Infinity;
    }

    if (typeof rawHealthFactor === "number") {
      return Number.isFinite(rawHealthFactor) ? rawHealthFactor : Infinity;
    }

    return null;
  } catch (e) {
    console.warn("⚠️ parseHealthFactor failed:", e.message);
    return null;
  }
}
