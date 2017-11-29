/* globals WebSocket */
import EventEmitter from 'events';
import find from 'lodash/find';

import findOne from './findOne';
import findMany from './findMany';
import insertOne from './insertOne';
import queue from './queue';
import * as logger from './logger';

let id = 0;

const maevaConnectMaevaSockets = (
  socketsUrl: string,
  options: TConnectorOptions = {}
) => {
  const emitter = new EventEmitter();
  let client;
  let _connectorId = {};
  let clientId = '?';
  const connect = () => {
    client = new WebSocket(socketsUrl);

    client.onopen = () => {
      emitter.emit('connected');
    };

    client.onerror = (error) => {
      console.log(error);
    };

    // Triggered when server emits response
    client.onmessage = (event: MessageEvent) => {
      if (options.debug) {
        logger.log('New message', clientId, JSON.parse(event.data), 2);
      }

      if (event.type === 'message') {
        const parsedMessage = JSON.parse(event.data.toString());
        if (parsedMessage.connectionInfo) {
          _connectorId.name = parsedMessage.connectionInfo.connector.id.name;
          clientId = parsedMessage.connectionInfo.socket.meta.id;
        } else if (parsedMessage.message) {
          const {message: {response, id: dataId}} = parsedMessage;
          if (isNaN(dataId)) {
            throw new Error('No queue id');
          }
          const queueItem = find(queue, {id: dataId});
          if (queueItem) {
            queueItem.resolve(response);
          } else {
            throw new Error('Queue item not found for id', dataId);
          }
        }
      }
    };
  };
  return {
    actions: {
      connect,
      disconnect: () => client && client.close(),
      insertOne: (candidate: Object, model, statementOptions) =>
        insertOne(client, candidate, model, statementOptions, id++),
      findOne: (query: Object, model, statementOptions) =>
        findOne(client, query, model, statementOptions, id++),
      findMany: (query: Object, model, statementOptions) =>
        findMany(client, query, model, statementOptions, id++),
    },
    emitter,
    name: 'websockets',
    id: _connectorId,
  };
};

export default maevaConnectMaevaSockets;
