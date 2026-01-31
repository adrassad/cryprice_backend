// src/config/networks.config.js
export const networksConfig = {
  ethereum: {
    CHAIN_ID: 1,
    NATIVE_SYMBOL: "ETH",
    ENABLED: true, // ← просто выключили
    RPC_URL: process.env.ETHEREUM_RPC_URL,
    protocols: {
      aave: {
        ADDRESSES_PROVIDER: process.env.ETHEREUM_AAVE_ADDRESSES_PROVIDER,
      },
    },
  },

  arbitrum: {
    CHAIN_ID: 42161,
    NATIVE_SYMBOL: "ETH",
    ENABLED: true,
    RPC_URL: process.env.ARBITRUM_RPC_URL,
    protocols: {
      aave: {
        ADDRESSES_PROVIDER: process.env.ARBITRUM_AAVE_ADDRESSES_PROVIDER,
      },
    },
  },

  avalanche: {
    CHAIN_ID: 43114,
    name: "avalanche",
    NATIVE_SYMBOL: "AVAX",
    ENABLED: true, // ← просто выключили
    RPC_URL: process.env.AVALANCHE_RPC_URL,
    protocols: {
      aave: {
        ADDRESSES_PROVIDER: process.env.AVALANCHE_AAVE_ADDRESSES_PROVIDER,
      },
    },
  },
};
