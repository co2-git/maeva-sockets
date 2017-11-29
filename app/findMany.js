
import sanitize from './sanitize';
import queue from './queue';

const findMany = (client: WebSocket, query, model, options = {}, id) => new Promise(
  async (resolve, reject) => {
    try {
      const message = JSON.stringify({
        action: 'findMany',
        id,
        model,
        query: {
          get: sanitize(query),
        },
      });
      // Send query to server which will echo it to connector
      client.send(message);
      // Queue listener for server response
      const queueItem: MaevaSocketsQueueItem = {
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

export default findMany;
