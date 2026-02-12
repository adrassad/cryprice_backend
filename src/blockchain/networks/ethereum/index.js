// blockchain/networks/arbitrum/index.js
import { JsonRpcProvider } from "ethers";

export function createEthereumNetwork(config) {
  return {
    name: "etherium",
    chainId: config.CHAIN_ID,
    provider: new JsonRpcProvider(config.RPC_URL),
    config: {
      protocols: config.protocols,
    },
  };
}
