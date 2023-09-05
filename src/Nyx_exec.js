import "./App.css";
import { contracts } from "@nymproject/contract-clients";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { settings } from "./settings.ts";


export default function Exec() {
  async function ExecuteOnNyx() {
    // Generate a signer from a mnemonic
    // const signer = await DirectSecp256k1HdWallet.fromMnemonic(
    //   "charge solid adjust talk rose there because bridge screen next swear rose uphold hammer grant agree slam damp lazy position coconut cabbage endless welcome",
    //   { prefix: "n" }
    // );

    const signer = await DirectSecp256k1HdWallet.fromMnemonic(settings.mnemonic, {
      prefix: "n",
    });
    const accounts = await signer.getAccounts();
    console.log("accounts:", accounts);


    
    // Make a signing client for the Nym Mixnet contract on mainnet
    // If RPC error use this URL instead: "wss://rpc.nymtech.net:443"
    const cosmWasmSigningClient = await SigningCosmWasmClient.connectWithSigner(
      // "wss://rpc.nymtech.net:443",
       settings.url,
      signer,
      {  gasPrice: {amount: 100000, denom: 'unym'} }
    );

    const client = new contracts.Mixnet.MixnetClient(
      cosmWasmSigningClient,
      accounts[0].address,
      "n17srjznxl9dvzdkpwpw24gg668wc73val88a6m5ajg6ankwvz9wtst0cznr"
    );

    // Delegate 1 NYM to mixnode with id 100
    const result = await client.delegateToMixnode(
      { mixId: 100 },
      "auto",
      undefined,
      [{ amount: `${1_000_000}`, denom: 'unym' }]
    );

    console.log(result);
  }
  ExecuteOnNyx();

  return <></>;
}
