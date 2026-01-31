import { AaveEthereumAdapter } from "./protocols/aave/ethereum.adapter.js";
import { AaveArbitrumAdapter } from "./protocols/aave/arbitrum.adapter.js";
import { AaveAvalancheAdapter } from "./protocols/aave/avalanche.adapter.js";

export function createProtocolAdapter({
  protocolName,
  networkName,
  provider,
  protocolConfig,
}) {
  if (!protocolName) {
    throw new Error("protocolName is required");
  }

  if (!networkName) {
    throw new Error("networkName is required");
  }

  if (protocolName === "aave") {
    switch (networkName) {
      case "ethereum":
        return new AaveEthereumAdapter({ provider, config: protocolConfig });

      case "arbitrum":
        return new AaveArbitrumAdapter({ provider, config: protocolConfig });

      case "avalanche":
        //console.log("caseavalanche: ", provider, protocolConfig);
        return new AaveAvalancheAdapter({ provider, config: protocolConfig });

      default:
        throw new Error(
          `Aave adapter not implemented for network ${networkName}`,
        );
    }
  }

  throw new Error(
    `Protocol ${protocolName} is not supported for network ${networkName}`,
  );
}
