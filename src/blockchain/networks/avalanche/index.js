// blockchain/networks/arbitrum/index.js
import { JsonRpcProvider } from "ethers";

export function createAvalancheNetwork(config) {
  return {
    name: "avalanche",
    chainId: config.CHAIN_ID,
    provider: new JsonRpcProvider(config.RPC_URL),
    config: {
      protocols: config.protocols,
    },
  };
}
