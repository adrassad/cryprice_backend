import express from "express";
import { getAsset } from "../../services/asset/asset.service.js";
import { getEnabledNetworks } from "../../services/network/network.service.js";
import { getAssetPrice } from "../../services/price/price.service.js";

const router = express.Router();

router.get("/:ticker", async (req, res) => {
  try {
    const priceByNetwork = {};
    const symbol = req.params.ticker.toUpperCase();
    const networks = await getEnabledNetworks();
    for (const network of Object.values(networks)) {
      priceByNetwork[network.name] = {};
      const asset = await getAsset(network.id, symbol);
      if (!asset) {
        continue;
      }
      const price = await getAssetPrice(network.id, asset.address);
      if (!price) {
        return res.status(404).json({ error: "Price not found" });
      }
      priceByNetwork[network.name] = price;
    }
    res.json(priceByNetwork);
  } catch (e) {
    console.error("❌ prices API failed:", e);
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
