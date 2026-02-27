// src/blockchain/abi/index.js

import * as ERC20 from "./erc20.abi.js";

// Aave ABI
import * as PoolAddressesProviderV3 from "./aave/poolAddressesProviderV3.abi.js";
import * as AavePoolV3 from "./aave/aavePoolV3.abi.js";
import * as UiPoolDataProviderV3 from "./aave/uiPoolDataProviderV3.abi.js";
import * as AaveOracle from "./aave/oracle.abi.js";
import * as AaveDataProvider from "./aave/aaveDataProvider.abi.js";

import { abiRegistry } from "./abiRegistry.js";
import { abiLoaderService } from "./abiloader.service.js";
import { bootstrapABI } from "./abiBootstrap.js";

const Aave = {
  PoolAddressesProviderV3,
  AavePoolV3,
  UiPoolDataProviderV3,
  Oracle: AaveOracle,
  DataProvider: AaveDataProvider,
};

export { ERC20, Aave, bootstrapABI, abiLoaderService };

export const AbiRegistry = abiRegistry;
