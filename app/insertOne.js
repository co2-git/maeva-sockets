// @flow
import queue from './queue';
import sanitize from './sanitize';
import * as constants from './constants';

const insertOne = (
  client: WebSocket,
  candidate: Object,
  model: Object,
  id: number
): Promise<Object> =>
  new Promise(
    async (resolve, reject) => {
      try {
        const message = JSON.stringify({
          action: constants.INSERT_ONE_EVENT,
          id,
          model,
          query: {
            set: sanitize(candidate),
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

export default insertOne;
