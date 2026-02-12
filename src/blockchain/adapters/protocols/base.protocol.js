//src/blockchain/adapters/protocols/base.protocol.js
import { BaseProtocol } from "../../protocols/base.protocol.js";
export class AaveBaseAdapter extends BaseProtocol {
  async getAssets() {
    throw new Error("Not implemented");
  }
  async getPrices(assets) {
    throw new Error("Not implemented");
  }
  async getUserPositions(userAddress) {
    throw new Error("Not implemented");
  }

  async getUserHealthFactor(userAddress) {
    throw new Error("Not implemented");
  }
}
