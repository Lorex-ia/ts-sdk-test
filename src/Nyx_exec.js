import "./App.css";
import { contracts } from "@nymproject/contract-clients";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { GasPrice } from "@cosmjs/stargate";
import { settings } from "./settings.ts";

export default function Exec() {
  let signer = null;
  let address = null;
  let signerMixnetClient = null;
  let cosmWasmSigningClient = null;
  let mixId = null;
  let amountToDelegate = null;
  let balance = null;
  let nodeAddress = null;
  let amountToSend = null;
  let delegations = null;

  async function ExecuteOnNyx() {
    // Signer
    try {
      // Generate a signer from a mnemonic
      signer = await DirectSecp256k1HdWallet.fromMnemonic(settings.mnemonic, {
        prefix: "n",
      });
      const accounts = await signer.getAccounts();
      address = accounts[0].address;
    } catch (error) {
      console.error("Problem getting the signer: ", error);
    }

    // Make a signing client for the Nym Mixnet contract on mainnet
    // If RPC error use this URL instead: "wss://rpc.nymtech.net:443"
    try {
      const cosmWasmClient = await SigningCosmWasmClient.connectWithSigner(
        settings.url,
        signer,
        {
          gasPrice: GasPrice.fromString("0.025unym"),
        }
      );
      cosmWasmSigningClient = cosmWasmClient;
      try {
        balance = await cosmWasmSigningClient?.getBalance(address, "unym");
        console.log("balance", balance);
      } catch (error) {
        console.error("problem geting the balance: ", error);
      }

      const mixnetClient = new contracts.Mixnet.MixnetClient(
        cosmWasmSigningClient,
        settings.address, // sender (that account of the signer)
        settings.mixnetContractAddress // contract address (different on mainnet, QA, etc)
      );
      signerMixnetClient = mixnetClient;
    } catch (error) {
      console.error("Problem getting the cosmWasmSigningClient: ", error);
    }
  }

  // get delegations
  const getDelegations = async () => {
    if (!signerMixnetClient) {
      return;
    }
    const delegationsObject = await signerMixnetClient.getDelegatorDelegations({
      delegator: settings.address,
    });
    delegations = delegationsObject;
  };

  // make delegation
  const doDelegation = async () => {
    if (!signerMixnetClient) {
      return;
    }
    try {
      const res = await signerMixnetClient.delegateToMixnode(
        { mixId },
        "auto",
        undefined,
        [{ amount: `${amountToDelegate}`, denom: "unym" }]
      );
      console.log("delegations: ", res);
    } catch (error) {
      console.error(error);
    }
  };

  // Undelegate all
  const doUndelegateAll = async () => {
    if (!signerMixnetClient) {
      return;
    }
    console.log("delegations", delegations);
    try {
      for (const delegation of delegations.delegations) {
        await signerMixnetClient.undelegateFromMixnode(
          { mixId: delegation.mix_id },
          "auto"
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Sending tokens
  const doSendTokens = async () => {
    const memo = "test sending tokens";

    try {
      const res = await cosmWasmSigningClient.sendTokens(
        settings.address,
        nodeAddress,
        [{ amount: amountToSend, denom: "unym" }],
        "auto",
        memo
      );
      console.log("res", res);
    } catch (error) {
      console.error(error);
    }
  };

  ExecuteOnNyx();
  setTimeout(() => getDelegations(), 1000);

  return (
    <div>
      <p>Exec</p>
      <div>
        <p>Send Tokens</p>
        <input
          type="string"
          placeholder="Node Address"
          onChange={(e) => (nodeAddress = e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          onChange={(e) => (amountToSend = e.target.value)}
        />
        <div>
          <button onClick={() => doSendTokens()}>Send Tokens</button>
        </div>
      </div>
      <div>
        <p>Delegate</p>
        <input
          type="number"
          placeholder="Mixnode Id"
          onChange={(e) => (mixId = e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount"
          onChange={(e) => (amountToDelegate = e.target.value)}
        />
        <div>
          <button onClick={() => doDelegation()}>Delegate</button>
        </div>
        <div>
          <button onClick={() => doUndelegateAll()}>Undelegate All</button>
        </div>
      </div>
    </div>
  );
}
