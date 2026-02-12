// blockchain/networks/arbitrum/index.js
import { JsonRpcProvider } from "ethers";

export function createArbitrumNetwork(config) {
  return {
    name: "arbitrum",
    chainId: config.CHAIN_ID,
    provider: new JsonRpcProvider(config.RPC_URL),
    config: {
      protocols: config.protocols,
    },
  };
}
