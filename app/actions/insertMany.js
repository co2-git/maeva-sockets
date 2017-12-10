import find from 'lodash/find';

import {pushQueue} from '../lib/queue';
import sanitize from '../lib/sanitize';
import clients from '../lib/clients';

const insertMany = (
  clientId,
  documents,
  model,
  // options = {},
) => new Promise(
  async (resolve, reject) => {
    try {
      console.log({clients, clientId});
      const client = find(clients, {id: clientId});
      pushQueue({
        socketId: client.socketId,
        resolve,
        reject,
      });
      const message = JSON.stringify({
        action: 'insertMany',
        socketId: client.socketId,
        model,
        query: {
          set: documents.map(sanitize),
        },
      });
      client.socket.send(message);
    } catch (error) {
      reject(error);
    }
  }
);

export default insertMany;
