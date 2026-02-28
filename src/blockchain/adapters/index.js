import { AaveAdapter } from "./protocols/aave/aave.adapter.js";

export function createProtocolAdapter({
  protocolName,
  networkName,
  provider,
  protocolConfig,
  AbiRegistry,
}) {
  if (!protocolName) {
    throw new Error("protocolName is required");
  }

  if (!networkName) {
    throw new Error("networkName is required");
  }

  if (protocolName === "aave") {
    return new AaveAdapter({
      provider,
      config: protocolConfig,
      AbiRegistry,
      networkName,
    });
  }

  throw new Error(
    `Protocol ${protocolName} is not supported for network ${networkName}`,
  );
}
