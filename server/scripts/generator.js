const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

const privateKey = secp.utils.randomPrivateKey();

console.log("Private key:", toHex(privateKey));

const publicKey = secp.getPublicKey(privateKey);
const address = getAddress(publicKey);

console.log("Address:", toHex(address));

function getAddress(publicKey) {
  // the first byte indicates whether this is in compressed form or not
  return keccak256(publicKey.slice(1)).slice(-20);
}
