import { createNymMixnetClient } from '@nymproject/sdk';
import { useEffect } from "react";

export default function MixnetTwo() {
  async function mixnetTrafficTwo() {
    try {
      const nym = await createNymMixnetClient();

      const nymApiUrl = 'https://validator.nymtech.net/api';

      nym.events.subscribeToTextMessageReceivedEvent((e) => {
        console.log('Got a message: ', e.args.payload);
      });

      await nym.client.start({
        clientId: 'My awesome client',
        nymApiUrl,
      });

      const payload = 'Hello mixnet';
      const recipient = nym.client.selfAddress();
      nym.client.send({ payload, recipient });

    } catch (error) {
      console.error('Error in mixnetTrafficTwo:', error);
    }
  }

  useEffect(() => {
    mixnetTrafficTwo();
  }, []);

  return (<></>);
};




