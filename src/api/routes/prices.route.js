import express from "express";
import { getAssetBySymbol } from "../../services/asset/asset.service.js";
import { getPricesBySymbol } from "../../cache/price.cache.js";

const router = express.Router();

router.get("/:ticker", async (req, res) => {
  try {
    const symbol = req.params.ticker.toUpperCase();

    const asset = await getAssetBySymbol(symbol);
    if (!asset?.length) {
      return res.status(404).json({ error: "Token not supported" });
    }

    const prices = await getPricesBySymbol(symbol);
    if (!prices.length) {
      return res.status(404).json({ error: "Price not found" });
    }

    res.json(
      prices.map((p) => ({
        chain_name: p.chain_name,
        symbol,
        address: p.address,
        priceUsd: p.priceUsd,
      })),
    );
  } catch (e) {
    console.error("❌ prices API failed:", e);
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
