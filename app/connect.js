// @flow
/* globals WebSocket */
import EventEmitter from 'events';
import find from 'lodash/find';

import insertOne from './insertOne';
import queue from './queue';

let id = 0;

type TConnectorOptions = {
  debug?: boolean,
};

const maevaConnectMaevaSockets = (
  socketsUrl: string,
  options: TConnectorOptions = {}
) => {
  const emitter = new EventEmitter();
  let client;
  let _connectorId = {};
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
      if (event.type === 'message') {
        const parsedMessage = JSON.parse(event.data.toString());
        if (parsedMessage.connectionInfo) {
          _connectorId.name = parsedMessage.connectionInfo.connector.id.name;
        } else if (parsedMessage.message) {
          const {message: {response, id: dataId}} = parsedMessage;
          console.log();
          console.log();
          console.log();
          console.log();
          console.log({response, dataId});
          console.log();
          console.log();
          console.log();
          const queueItem = find(queue, {id: dataId});
          if (options.debug) {
            console.log('client got response', {response, dataId});
          }
          if (queueItem) {
            queueItem.resolve(response);
          }
        }
      }
    };
  };
  return {
    actions: {
      connect,
      disconnect: () => client && client.close(),
      insertOne: (candidate: Object, model: MaevaModel) =>
        insertOne(client, candidate, model, id++),
    },
    emitter,
    name: 'websockets',
    id: _connectorId,
  };
};

export default maevaConnectMaevaSockets;
