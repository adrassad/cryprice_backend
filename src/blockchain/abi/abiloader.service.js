// src/blockchain/abi/abiloader.service.js
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const ABI_EXPLORERS = {
  ethereum: {
    url: process.env.ETHEREUM_EXPLORER,
    chainId: 1,
    key: process.env.ETHEREUM_EXPLORER_KEY,
    type: "v2",
  },
  arbitrum: {
    url: process.env.ARBITRUM_EXPLORER,
    chainId: 42161,
    key: process.env.ARBITRUM_EXPLORER_KEY,
    type: "v2",
  },
  avalanche: {
    url: process.env.AVALANCHE_EXPLORER,
    chainId: 43114,
    key: process.env.AVALANCHE_EXPLORER_KEY,
    type: "snowtrace",
  },
};

export class ABILoaderService {
  constructor(baseDir) {
    this.baseDir = baseDir || path.resolve(process.cwd(), "src/blockchain/abi");
    this.memoryCache = new Map();
  }

  buildKey(network, address) {
    return `${network}:${address.toLowerCase()}`;
  }

  buildPath(network, protocol, contract) {
    return path.join(
      this.baseDir,
      network,
      protocol,
      `${contract.toLowerCase()}.json`,
    );
  }

  /** Load ABI from memory or disk */
  async loadABI(network, protocol, contract) {
    const key = this.buildKey(network, contract);
    if (this.memoryCache.has(key)) return this.memoryCache.get(key);

    const filePath = this.buildPath(network, protocol, contract);
    if (!fs.existsSync(filePath)) return null;

    const abi = JSON.parse(fs.readFileSync(filePath, "utf8"));
    this.memoryCache.set(key, abi);
    return abi;
  }

  /** Save ABI to disk + memory */
  async saveABI(network, protocol, contract, abi) {
    const dir = path.join(this.baseDir, network, protocol);
    fs.mkdirSync(dir, { recursive: true });

    const filePath = this.buildPath(network, protocol, contract);
    fs.writeFileSync(filePath, JSON.stringify(abi, null, 2), "utf8");

    const key = this.buildKey(network, contract);
    this.memoryCache.set(key, abi);

    console.log(`✅ ABI saved → ${network}/${protocol}/${contract}`);
  }

  /** Fetch ABI from explorer */
  async fetchABI(network, address) {
    const explorer = ABI_EXPLORERS[network];
    if (!explorer || !explorer.url)
      throw new Error(`Explorer not configured for ${network}`);

    let url;
    if (explorer.type === "v2") {
      if (!explorer.key) throw new Error(`API key missing for ${network}`);
      url = `${explorer.url}v2/api?module=contract&action=getabi&address=${address}&chainid=${explorer.chainId}&apikey=${explorer.key}`;
    } else if (explorer.type === "snowtrace") {
      url = `${
        explorer.url
      }api?module=contract&action=getabi&address=${address}&apikey=${
        explorer.key || ""
      }`;
    } else {
      throw new Error(`Unsupported explorer type for ${network}`);
    }

    console.log(`Fetching ABI: ${network} → ${address}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    if (json.status !== "1")
      throw new Error(json.result || "ABI not available");

    return JSON.parse(json.result);
  }

  /** Load ABI from cache or fetch + save */
  async getABI(network, protocol, contract) {
    let abi = await this.loadABI(network, protocol, contract);
    if (abi) return abi;

    abi = await this.fetchABI(network, contract);
    await this.saveABI(network, protocol, contract, abi);
    return abi;
  }
}

export const abiLoaderService = new ABILoaderService();
