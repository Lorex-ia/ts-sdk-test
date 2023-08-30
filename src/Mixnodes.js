import "./App.css";
import { contracts } from "@nymproject/contract-clients";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useEffect, useState } from "react";

// This example is just meant to query a list of Mixnodes and print them on a page
export default function Mixnodes() {
  const [mixnodes, setMixnodes] = useState(null);

  async function fetchMixnodes() {
    // Const client = new contracts.Mixnet.MixnetClient('n17srjznxl9dvzdkpwpw24gg668wc73val88a6m5ajg6ankwvz9wtst0cznr');
    // This is just the CosmWasm client, not the siger
    const cosmWasmClient = await SigningCosmWasmClient.connect(
      "wss://rpc.nymtech.net:443"
    );

    const client = new contracts.Mixnet.MixnetQueryClient(
      cosmWasmClient,
      "n17srjznxl9dvzdkpwpw24gg668wc73val88a6m5ajg6ankwvz9wtst0cznr" // contract address (different on mainnet, QA, etc)
    );
    console.log("client:", client);
    const result = await client.getMixNodesDetailed({});
    console.log(result);
    //Do .nodes since it's the name of the array to be iterated on (see console)
    setMixnodes(result.nodes);
  }

  useEffect(() => {
    fetchMixnodes();
  }, []);

  return (
    <>
      There are {mixnodes?.length || "no"} nodes
      {/* this is the same but using the elvis operator: There are {mixnodes? mixnodes.length : "no"} nodes */}
      <table>
        <tbody>
          {
            mixnodes?.map((value, index) => {
              return (
                <tr key={index}>
                  <td> {value?.bond_information?.mix_node?.identity_key} </td>
                </tr>
              );
            })
          }
        </tbody>
      </table>
    </>
  );
}
