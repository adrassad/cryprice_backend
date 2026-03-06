import { lanhuage } from "../locales/index.js";

// src/bot/constants/buttons.js
export function button(lan = "en") {
  return Object.freeze({
    ADD_WALLET: lanhuage(lan, "wallet_buttom_add"),
    REMOVE_WALLET: lanhuage(lan, "wallet_buttom_del"),
  });
}
