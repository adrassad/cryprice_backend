// src/integrations/private/access-policy.js
export async function assertCanAddWallet() {
  return true;
}

export async function assertCanViewPositions() {
  return true;
}

export async function upgradeToPro() {
  throw new Error("Private module is not available in public repository.");
}
