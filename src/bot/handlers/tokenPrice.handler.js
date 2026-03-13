import { getAssetBySymbol } from "../../services/asset/asset.service.js";
import { getAssetPriceUSD } from "../../services/price/price.service.js";

export function tokenPriceHandler(bot) {
  bot.on("text", async (ctx) => {
    const text = ctx.message.text.trim();

    if (text.startsWith("/")) return;
    if (ctx.scene?.current) return;

    const parts = text.split(/\s+/);

    let symbol = parts[0].toUpperCase();
    const amount = parts[1] ? Number(parts[1]) : 1;

    if (isNaN(amount)) return;

    try {
      let netAsset = await getAssetBySymbol(symbol);

      if (netAsset.size === 0) {
        symbol = "W" + symbol;
      }

      netAsset = await getAssetBySymbol(symbol);
      if (netAsset.size === 0) {
        await ctx.reply(`🪙 Токен <b>${symbol}</b> не найден`, {
          parse_mode: "HTML",
        });
        return;
      }

      let message = `💰 <b>${symbol}</b>\n`;
      message += `<pre>`;

      for (const [network, asset] of netAsset) {
        const priceUSD = await getAssetPriceUSD(network.id, asset.address);

        const total = priceUSD * amount;

        message += `${network.name}\n`;
        message += `${amount} ${symbol} = $${total.toFixed(2)}\n`;
        message += `price: $${priceUSD.toFixed(2)}\n\n`;
      }

      message += `</pre>`;

      await ctx.reply(message, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
      });
    } catch (err) {
      console.error(err);
      await ctx.reply("⚠️ Ошибка получения цены");
    }
  });
}
