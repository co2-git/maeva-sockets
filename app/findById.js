import queue from './queue';

const findById = (client: WebSocket, docId, model, options = {}, id) =>
new Promise(async (resolve, reject) => {
  try {
    const message: MaevaSocketsClientRequest = JSON.stringify({
      action: 'findById',
      id,
      model,
      query: {
        get: docId,
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
});

export default findById;
