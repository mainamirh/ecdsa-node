const express = require("express");
const secp = require("ethereum-cryptography/secp256k1");
const {
  utf8ToBytes,
  toHex,
  hexToBytes,
} = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "0xc726efbf191cc6de99d0df3f410c0acec09ba3f1": 100,
  "0xdde241c82361a7e52d2bbe00f5a2adb734590f42": 50,
  "0x0a310a5cacef02d03d1090757d3698bc9453deb1": 75,
};

const message = "transaction";
const messageBytes = utf8ToBytes(message);
const messageHash = keccak256(messageBytes);

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { signature, recoveryKey, amount, recipient } = req.body;
  // Getting address from signature
  const publicKey = secp.recoverPublicKey(
    messageHash,
    hexToBytes(signature),
    recoveryKey
  );
  const address = `0x${toHex(keccak256(publicKey.slice(1)).slice(-20))}`;

  setInitialBalance(address);
  setInitialBalance(recipient);

  if (balances[address] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[address] -= amount;
    balances[recipient] += amount;
    res.status(200).send({ message: "Succeed", balance: balances[address] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
