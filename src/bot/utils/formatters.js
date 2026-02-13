// src/bot/utils/formatters.js
export function formatHealthFactorForUI(value, fractionDigits = 2) {
  let icon = "♾️";
  if (value === null) return `${icon} (∞)`;
  if (value === 0) return `${icon} (∞)`;
  if (value === Infinity) return `${icon} (∞)`;

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return "❓ (invalid)";
  }

  if (numericValue > 2) {
    icon = "💚";
  } else if (numericValue > 1.5) {
    icon = "💛";
  } else if (numericValue > 1.2) {
    icon = "🧡";
  } else if (numericValue > 1) {
    icon = "❤️";
  } else {
    icon = "💔";
  }

  return `${icon} (${numericValue.toFixed(fractionDigits)})`;
}
