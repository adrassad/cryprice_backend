// src/blockchain/index.js

import { networksRegistry } from "./networks/index.js";
import { AbiRegistry, bootstrapABI } from "./abi/index.js";
import { createProtocolAdapter } from "./adapters/index.js";
import { Contract } from "ethers";

let initialized = false;

/**
 * Инициализация blockchain слоя
 * вызывается 1 раз при старте приложения
 */
export async function initBlockchain() {
  if (initialized) return;

  console.log("⏱ Blockchain init...");

  await bootstrapABI();

  initialized = true;

  console.log("✅ Blockchain ready");
}

/**
 * resolve protocol adapter
 */
function resolveProtocol(networkName, protocolName) {
  const network = networksRegistry[networkName];

  if (!network) throw new Error(`Network ${networkName} not supported`);

  const protocolConfig = network.config.protocols?.[protocolName];

  if (!protocolConfig)
    throw new Error(
      `Protocol ${protocolName} not configured for ${networkName}`,
    );

  return createProtocolAdapter({
    protocolName,
    networkName,
    provider: network.provider,
    protocolConfig,
    AbiRegistry,
  });
}

/**
 * универсальный helper получения контракта
 */
export function getContract(networkName, address) {
  const network = networksRegistry[networkName];

  if (!network) throw new Error(`Network ${networkName} not supported`);

  const abi = AbiRegistry.get(networkName, address);

  return new Contract(address, abi, network.provider);
}

/**
 * PUBLIC API
 */

export async function getAssets(networkName, protocolName) {
  return resolveProtocol(networkName, protocolName).getAssets();
}

export async function getPrices(networkName, protocolName, assets) {
  return resolveProtocol(networkName, protocolName).getPrices(assets);
}

export async function getUserPositions(networkName, protocolName, wallet) {
  return resolveProtocol(networkName, protocolName).getUserPositions(wallet);
}

export async function getUserHealthFactor(networkName, protocolName, wallet) {
  return resolveProtocol(networkName, protocolName).getUserHealthFactor(wallet);
}

/**
 * debug/helper
 */
export function getProtocolsContracts(networkName) {
  const network = networksRegistry[networkName];

  if (!network) throw new Error(`Network ${networkName} not supported`);

  const protocols = network.config.protocols;

  if (!protocols) return [];

  return Object.entries(protocols).map(([protocolName, contracts]) => ({
    name: protocolName,

    contracts: Object.entries(contracts).map(([name, address]) => ({
      name,
      address,
    })),
  }));
}
