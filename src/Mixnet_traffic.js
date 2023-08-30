import "./App.css";
import { createNymMixnetClient } from "@nymproject/sdk-full-fat";
import { useEffect, useState } from "react";

const nymApiUrl = "https://validator.nymtech.net/api";

// This example explores the creation of a communication app on the Mixnet:
export default function Mixnet() {
  const [selfAddress, setSelfAddress] = useState(null);
  const [nymClient, setNymClient] = useState(null);

  async function mixnetTraffic() {
    const nym = await createNymMixnetClient();
    console.log("Client >>>", nym);

    // Start the client and wait 3 seconds for it to connect to the network
    try {
      const clientID = window.crypto.randomUUID();
      console.log("My client ID is", clientID);

      await nym?.client.start({ nymApiUrl, clientId: clientID });
      if (nym) setNymClient(nym);
    } catch (error) {
      console.log(error);
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Check when is connected and set the self address
    nym?.events.subscribeToConnected((e) => {
      console.log("setting self address to", e.args);
      const { address } = e.args;
      setSelfAddress(address);
    });

    // Listen for incoming messages
    nym?.events.subscribeToTextMessageReceivedEvent((event) => {
      console.log("Received a message!", event.args.payload);
    });

    // send a message to yourself
    // console.log("Sending a message to myself...");
    // try {
    //     await nym.client.init();
    // } catch (error) {
    //     console.log(error)
    // }
  }
  function sendMessage() {
    nymClient?.client.send({
      payload: { message: "Hello mixnet", mimeType: "text/plain" },
      recipient: selfAddress,
    });
  }

  useEffect(() => {
    mixnetTraffic();

    return async () => {
      console.log("diconnecting");
      await nymClient?.client.stop();
    };
  }, []);

  return (
    <>
      <button onClick={sendMessage}>Send your message</button>
    </>
  );
}
