// src/bot/keyboards/main.keyboard.js
import { Markup } from "telegraf";
import { button } from "../constants/buttons.js";

export function mainKeyboard() {
  return Markup.keyboard([[button().ADD_WALLET], [button().REMOVE_WALLET]])
    .resize()
    .persistent();
}
