//src/api/routes/assets.route.js
import express from "express";
import { getAssetsByNetworks } from "../../services/asset/asset.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  //console.log("API assets");
  try {
    const assets = await getAssetsByNetworks(); // ждём результат
    //console.warn("API assets: ", assets);
    res.json(assets);
  } catch (e) {
    console.error("❌ Failed to get assets:", e);
    res.status(500).json({ error: "Failed to get assets" });
  }
});

export default router;
