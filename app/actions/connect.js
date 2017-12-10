/* globals WebSocket */
import find from 'lodash/find';

import * as logger from '../lib/logger';
import queue from '../lib/queue';
import clients from '../lib/clients';
// import * as socketId from '../lib/id';

const connect = (clientId, url, emitter, options = {}) => {
  const client = find(clients, {id: clientId});

  client.socket = new WebSocket(url);

  client.socket.onopen = () => {
    // ...
  };

  client.socket.onerror = (error) => {
    // if (client.readyState !== 1 && clientStatus === 'disconnected') {
    //   emitter.emit('disconnected');
    // }
    console.log(error);
  };

  client.socket.onclose = () => {
    emitter.emit('disconnected');
  };

  // Triggered when server emits response
  client.socket.onmessage = (event) => {
    if (options.debug) {
      logger.log('New message', client.id, JSON.parse(event.data), 2);
    }
    if (event.type === 'message') {
      const parsedMessage = JSON.parse(event.data.toString());
      if (parsedMessage.connectionInfo) {
        client.connectorIdName = parsedMessage.connectionInfo.connectorIdName;
        client.socketId = parsedMessage.connectionInfo.socket.meta.id;
        if (client.connectorIdName && client.socketId !== '?') {
          console.log('CONNECTED');
          emitter.emit('connected');
        }
      } else if (parsedMessage.message) {
        try {
          const {message: {response, socketId}} = parsedMessage;
          if (isNaN(socketId)) {
            throw new Error('Message has no socket id');
          }
          const queueItem = find(queue, {socketId, done: false});
          if (queueItem) {
            console.log('GOT QUEUE ITEM', queueItem);
            queueItem.resolve(response);
            queueItem.done = true;
            pullQueue(queueItem.id);
          } else {
            console.log({queue});
            throw new Error(`Queue item not found for id ${socketId}`);
          }
        } catch (error) {
          console.log(error.stack);
        }
      }
    }
  };
};

export default connect;
