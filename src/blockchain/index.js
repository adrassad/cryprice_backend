import { networksRegistry } from "./networks/index.js";
import { createProtocolAdapter } from "./adapters/index.js";

function resolveProtocol(networkName, protocolName) {
  const network = networksRegistry[networkName];

  if (!network) {
    throw new Error(`Network ${networkName} not supported`);
  }

  const protocolConfig = network.config.protocols?.[protocolName];

  if (!protocolConfig) {
    throw new Error(
      `Protocol ${protocolName} not configured for network ${networkName}`,
    );
  }

  return createProtocolAdapter({
    protocolName,
    networkName,
    provider: network.provider,
    protocolConfig,
  });
}

export async function getAssets(networkName, protocolName) {
  const protocol = resolveProtocol(networkName, protocolName);
  return protocol.getAssets();
}

export async function getPrices(networkName, protocolName, assets) {
  const protocol = resolveProtocol(networkName, protocolName);
  return protocol.getPrices(assets);
}

export async function getUserPositions(
  networkName,
  protocolName,
  walletAddress,
) {
  const protocol = resolveProtocol(networkName, protocolName);
  return protocol.getUserPositions(walletAddress);
}

export async function getUserHealthFactor(
  networkName,
  protocolName,
  walletAddress,
) {
  const protocol = resolveProtocol(networkName, protocolName);
  return protocol.getUserHealthFactor(walletAddress);
}
