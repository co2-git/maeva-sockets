import find from 'lodash/find';

import queue from '../lib/queue';
import sanitize from '../lib/sanitize';
import clients from '../lib/clients';

const count = (
  clientId,
  queries,
  model,
  // options = {},
) => new Promise(
  async (resolve, reject) => {
    try {
      console.log({clients, clientId});
      const client = find(clients, {id: clientId});
      const message = JSON.stringify({
        action: 'count',
        id: client.socketId,
        model,
        query: {
          get: queries.map(sanitize),
        },
      });
      // Send query to server which will echo it to connector
      client.socket.send(message);
      // Queue listener for server response
      const queueItem = {
        id: client.socketId,
        resolve,
        reject,
      };
      queue.push(queueItem);
    } catch (error) {
      reject(error);
    }
  }
);

export default count;
