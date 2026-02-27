// src/blockchain/abi/abiBootstrap.js
import { abiLoaderService } from "./abiloader.service.js";
import { abiRegistry } from "./abiRegistry.js";
import { networksConfig } from "../../config/networks.config.js";
import { networksRegistry } from "../networks/index.js";

/**
 * На этапе bootstrap загружаем все ABI в память
 */
export async function bootstrapABI() {
  console.log("⏱ ABI bootstrap started");

  for (const [networkName, network] of Object.entries(networksConfig)) {
    if (!network.ENABLED) continue;

    const provider = networksRegistry[networkName].provider;

    const protocols = network.protocols || {};

    for (const [protocolName, contracts] of Object.entries(protocols)) {
      for (const [contractName, address] of Object.entries(contracts)) {
        try {
          // Загружаем основной ABI
          const abi = await abiLoaderService.getABI(
            networkName,
            protocolName,
            address,
          );

          // Сохраняем в Registry для быстрого доступа
          abiRegistry.save(networkName, address, abi, protocolName);

          // Для Aave и похожих протоколов нужно предзагрузить вспомогательные контракты
          if (protocolName.toLowerCase() === "aave") {
            // Попытка узнать Pool, Oracle и DataProvider
            const providerContract = new (await import("ethers")).Contract(
              address,
              abi,
              provider,
            );

            // Pool
            try {
              const poolAddress = await providerContract.getPool();
              if (poolAddress) {
                const poolAbi = await abiLoaderService.getABI(
                  networkName,
                  protocolName,
                  poolAddress,
                );
                abiRegistry.save(
                  networkName,
                  poolAddress,
                  poolAbi,
                  protocolName,
                );
              }
            } catch (e) {
              console.warn(`Cannot fetch Pool for ${address}: ${e.message}`);
            }

            // Oracle
            try {
              const oracleAddress = await providerContract.getPriceOracle();
              if (oracleAddress) {
                const oracleAbi = await abiLoaderService.getABI(
                  networkName,
                  protocolName,
                  oracleAddress,
                );
                abiRegistry.save(
                  networkName,
                  oracleAddress,
                  oracleAbi,
                  protocolName,
                );
              }
            } catch (e) {
              console.warn(`Cannot fetch Oracle for ${address}: ${e.message}`);
            }

            // DataProvider
            try {
              const dataProviderAddress =
                await providerContract.getPoolDataProvider();
              if (dataProviderAddress) {
                const dataProviderAbi = await abiLoaderService.getABI(
                  networkName,
                  protocolName,
                  dataProviderAddress,
                );
                abiRegistry.save(
                  networkName,
                  dataProviderAddress,
                  dataProviderAbi,
                  protocolName,
                );
              }
            } catch (e) {
              console.warn(
                `Cannot fetch DataProvider for ${address}: ${e.message}`,
              );
            }
          }

          // маленькая задержка чтобы не упереться в rate-limit
          await new Promise((r) => setTimeout(r, 200));
        } catch (e) {
          console.error(
            `❌ ABI bootstrap failed for ${networkName}/${protocolName}/${contractName} (${address})`,
            e.message,
          );
        }
      }
    }
  }

  console.log("✅ ABI bootstrap finished");
}
