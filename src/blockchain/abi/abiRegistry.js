import fs from "fs";
import path from "path";
import { abiCache } from "../../cache/abi.cache.js";
import { fetchABI } from "./abiExplorer.js";

class ABIRegistry {
  constructor() {
    this.memory = new Map();

    this.baseDir = path.resolve(process.cwd(), "src/blockchain/abi");
  }

  buildKey(network, address) {
    return `${network}:${address.toLowerCase()}`;
  }

  buildPath(network, address, protocol) {
    return path.join(
      this.baseDir,
      network,
      protocol,
      address.toLowerCase() + ".json",
    );
  }

  async get(network, address) {
    if (!network || !address) throw new Error("network/address required");

    const key = this.buildKey(network, address);

    // memory
    if (this.memory.has(key)) return this.memory.get(key);

    // redis
    const cached = await abiCache.get(network, address);

    if (cached) {
      this.memory.set(key, cached);

      return cached;
    }

    // filesystem
    const file = this.buildPath(network, address);

    if (fs.existsSync(file)) {
      const abi = JSON.parse(fs.readFileSync(file));

      this.memory.set(key, abi);

      await abiCache.set(network, address, abi);

      return abi;
    }

    // explorer fallback
    const abi = await fetchABI(network, address);

    await this.save(network, address, abi);

    return abi;
  }

  async save(network, address, abi, protocolName) {
    const file = this.buildPath(network, address, protocolName);

    fs.mkdirSync(path.dirname(file), { recursive: true });

    fs.writeFileSync(file, JSON.stringify(abi, null, 2));

    await abiCache.set(network, address, abi);

    this.memory.set(this.buildKey(network, address), abi);

    console.log(`ABI saved ${network} ${address}`);
  }
}

export const abiRegistry = new ABIRegistry();
