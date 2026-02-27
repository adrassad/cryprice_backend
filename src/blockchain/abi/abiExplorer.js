//src/blockchain/abi/abiExplorer.js
import fetch from "node-fetch";

const EXPLORERS = {
  ethereum: {
    type: "etherscanV2",
    url: process.env.ETHEREUM_EXPLORER,
    chainId: 1,
    apiKey: process.env.ETHEREUM_EXPLORER_KEY,
  },

  arbitrum: {
    type: "etherscanV2",
    url: process.env.ARBITRUM_EXPLORER,
    chainId: 42161,
    apiKey: process.env.ARBITRUM_EXPLORER_KEY,
  },

  avalanche: {
    type: "snowtrace",
    url: process.env.AVALANCHE_EXPLORER,
    apiKey: process.env.AVALANCHE_EXPLORER_KEY,
  },
};

export async function fetchABI(network, address) {
  const explorer = EXPLORERS[network];

  if (!explorer) throw new Error(`Explorer not configured: ${network}`);

  let url;

  if (explorer.type === "etherscanV2") {
    url =
      `${explorer.url}v2/api` +
      `?module=contract` +
      `&action=getabi` +
      `&address=${address}` +
      `&chainid=${explorer.chainId}` +
      `&apikey=${explorer.apiKey}`;
  }

  if (explorer.type === "snowtrace") {
    url =
      `${explorer.url}api` +
      `?module=contract` +
      `&action=getabi` +
      `&address=${address}` +
      `&apikey=${explorer.apiKey}`;
  }

  const res = await fetch(url);

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = await res.json();

  if (json.status !== "1") throw new Error(json.result);

  return JSON.parse(json.result);
}
