import sanitize from './sanitize';
import queue from './queue';

const updateById = (
  client, docId, updater, model, options = {}, id) => new Promise(
  async (resolve, reject) => {
    try {
      const message = JSON.stringify({
        action: 'updateById',
        id,
        model,
        query: {
          get: docId,
          set: sanitize(updater)
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

export default updateById;
