import queue from './queue';
import sanitize from './sanitize';

const insertMany = (
  client: WebSocket,
  documents,
  model,
  options = {},
  id: number
): Promise<Object> =>
  new Promise(
    async (resolve, reject) => {
      try {
        const message = JSON.stringify({
          action: 'insertMany',
          id,
          model,
          query: {
            set: documents.map(sanitize),
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

export default insertMany;
