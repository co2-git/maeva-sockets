import sanitize from './sanitize';
import queue from './queue';

const findOne = (client: WebSocket, query, model, options = {}, id) => new Promise(
  async (resolve, reject) => {
    try {
      const message = JSON.stringify({
        action: 'findOne',
        id,
        model,
        query: {
          get: sanitize(query),
        },
      });
      // Send query to server which will echo it to connector
      client.send(message);
      // Queue listener for server response
      const queueItem = {
        id,
        resolve,
        reject,
      };
      queue.push(queueItem);
    } catch (error) {
      reject(error);
    }
  }
);

export default findOne;
