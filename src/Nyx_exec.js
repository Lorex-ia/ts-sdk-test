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
  let mixId = null;
  let amount = null;
  let balance = null;

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
      const cosmWasmSigningClient =
        await SigningCosmWasmClient.connectWithSigner(settings.url, signer, {
          gasPrice: GasPrice.fromString("0.025unym"),
        });
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

  // Delegate to a Mixnode
  // const doDelegation = async () => {
  //   try {
  //     const result = await signerMixnetClient.delegateToMixnode(
  //       { mixId },
  //       "auto",
  //       undefined,
  //       [{ amount, denom: "unym" }]
  //     );

  //     console.log(result);
  //   } catch (error) {
  //     console.error("Problem delegating: ", error);
  //   }
  // };
  const doDelegation = async () => {
    if (!signerMixnetClient) {
      return;
    }
    console.log("mixId", mixId, "amount", amount);
    try {
      const res = await signerMixnetClient.delegateToMixnode(
        { mixId },
        "auto",
        undefined,
        [{ amount: `${amount}`, denom: "unym" }]
      );
      console.log("res", res);
    } catch (error) {
      console.error(error);
    }
  };

  ExecuteOnNyx();

  return (
    <div>
      <p>Exec</p>
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
          onChange={(e) => (amount = e.target.value)}
        />
        <div>
          <button onClick={() => doDelegation()}>Delegate</button>
        </div>
      </div>
    </div>
  );
}
