import find from 'lodash/find';

import {pushQueue} from '../lib/queue';
import sanitize from '../lib/sanitize';
import clients from '../lib/clients';

const removeMany = (
  clientId,
  queries,
  model,
  options = {},
) => new Promise(
  async (resolve, reject) => {
    try {
      console.log({clients, clientId});
      const client = find(clients, {id: clientId});
      console.log({REMOVEMANY: {client, queries, model, options}});
      pushQueue({
        socketId: client.socketId,
        resolve,
        reject,
      });
      const message = JSON.stringify({
        action: 'removeMany',
        socketId: client.socketId,
        model,
        query: {
          get: queries.map(sanitize),
        },
      });
      client.socket.send(message);
    } catch (error) {
      reject(error);
    }
  }
);

export default removeMany;
