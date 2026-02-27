import { redis } from "../redis/redis.client.js";

const PREFIX = "abi";

class ABICache {
  buildKey(network, address) {
    return `${PREFIX}:${network}:${address.toLowerCase()}`;
  }

  async get(network, address) {
    const key = this.buildKey(network, address);

    const data = await redis.get(key);

    if (!data) return null;

    return JSON.parse(data);
  }

  async set(network, address, abi) {
    const key = this.buildKey(network, address);

    await redis.set(key, JSON.stringify(abi));
  }
}

export const abiCache = new ABICache();
