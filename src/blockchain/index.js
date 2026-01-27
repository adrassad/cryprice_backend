//src/blockchain/index.js
import { networksRegistry } from "./networks/index.js";
import { createProtocolAdapter } from "./protocols/createProtocolAdapter.js";

export async function getAssets(networkName, protocolName) {
  const network = networksRegistry[networkName];
  if (!network) {
    throw new Error(`Network ${networkName} not supported`);
  }
  const protocolConfig = network.config.protocols?.[protocolName];
  if (!protocolConfig) {
    throw new Error(
      `Protocol ${protocolName} not configured for ${networkName}`,
    );
  }
  const protocol = createProtocolAdapter({
    protocolName,
    provider: network.provider,
    protocolConfig,
  });
  return protocol.getAssets();
}

export async function getPrices(networkName, protocolName, assets) {
  const network = networksRegistry[networkName];
  if (!network) {
    throw new Error(`Network ${networkName} not supported`);
  }
  const protocolConfig = network.config.protocols?.[protocolName];
  if (!protocolConfig) {
    throw new Error(
      `Protocol ${protocolName} not configured for ${networkName}`,
    );
  }
  const protocol = createProtocolAdapter({
    protocolName,
    provider: network.provider,
    protocolConfig,
  });
  return await protocol.getPrices(assets);
}

export async function getAaveUserPositions(
  networkName,
  protocolName,
  walletAddress,
) {
  const network = networksRegistry[networkName];
  if (!network) {
    throw new Error(`Network ${networkName} not supported`);
  }
  const protocolConfig = network.config.protocols?.[protocolName];
  if (!protocolConfig) {
    throw new Error(
      `Protocol ${protocolName} not configured for ${networkName}`,
    );
  }
  const protocol = createProtocolAdapter({
    protocolName,
    provider: network.provider,
    protocolConfig,
  });
  //console.log("createProtocolAdapter protocol:", protocol);
  return await protocol.getUserPositions(walletAddress);
}
