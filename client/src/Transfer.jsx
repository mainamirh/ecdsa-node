import { useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { utf8ToBytes, bytesToHex } from "ethereum-cryptography/utils";

const privateKeyMap = {
  "0xc726efbf191cc6de99d0df3f410c0acec09ba3f1": import.meta.env
    .VITE_PRIVATE_KEY_1,
  "0xdde241c82361a7e52d2bbe00f5a2adb734590f42": import.meta.env
    .VITE_PRIVATE_KEY_2,
  "0x0a310a5cacef02d03d1090757d3698bc9453deb1": import.meta.env
    .VITE_PRIVATE_KEY_3,
};

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [isSigned, setIsSigned] = useState(false);
  const [signature, setSignature] = useState("");
  const [recoveryKey, setRecoveryKey] = useState("");
  const [label, setLabel] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        signature: bytesToHex(signature),
        recoveryKey: recoveryKey,
        amount: parseInt(sendAmount),
        recipient,
      });
      setBalance(balance);
      setIsSigned(false);
      setSendAmount("");
      setRecipient("");
      setLabel("Succeed");
    } catch (ex) {
      alert(ex.response.data.message);
      setLabel("Failed");
    } finally {
      setTimeout(() => {
        setLabel("");
      }, 4000);
    }
  }

  async function sign(evt) {
    evt.preventDefault();

    if (!address || !recipient || !sendAmount || address === recipient) return;

    const privateKey = privateKeyMap[address];

    const message = "transaction";
    const messageBytes = utf8ToBytes(message);
    const messageHash = keccak256(messageBytes);

    if (privateKey) {
      const [sig, recoveryKey] = await secp.sign(messageHash, privateKey, {
        recovered: true,
      });
      setSignature(sig);
      setRecoveryKey(recoveryKey);
      setIsSigned(true);
    }
  }

  return (
    <form className="container transfer" onSubmit={isSigned ? transfer : sign}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        />
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        />
      </label>

      <label style={{ color: label === "Succeed" ? "green" : "red" }}>
        {label}
      </label>

      <input
        type="submit"
        className="button"
        value={isSigned ? "Transfer" : "Sign"}
      />
    </form>
  );
}

export default Transfer;
