// src/bot/utils/formatters.js
export function formatHealthFactorForUI(value, fractionDigits = 4) {
  if (value === null) return "0.0000";
  if (value === Infinity) return "∞";
  return value.toFixed(fractionDigits);
}
