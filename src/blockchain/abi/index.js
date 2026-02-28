// src/blockchain/abi/index.js

import * as ERC20 from "./erc20.abi.js";

// Aave ABI

import { abiRegistry } from "./abiRegistry.js";
import { abiLoaderService } from "./abiloader.service.js";
import { bootstrapABI } from "./abiBootstrap.js";

export { ERC20, bootstrapABI, abiLoaderService };

export const AbiRegistry = abiRegistry;
