// @flow
/* globals WebSocket */
import find from 'lodash/find';
import EventEmitter from 'events';
import findOne from './findOne';
import insertOne from './insertOne';
import queue from './queue';

let id = 0;

const maevaConnectMaevaSockets = (socketsUrl: string): MaevaConnector => {
  const emitter = new EventEmitter();
  let client;
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
        const {response, id: dataId}: MaevaSocketsServerResponse = JSON.parse(
          event.data.toString()
        );
        const queueItem: ?MaevaSocketsQueueItem = find(queue, {id: dataId});
        if (queueItem) {
          queueItem.resolve(response);
        }
      }
    };
  };
  return {
    actions: {
      connect,
      disconnect: () => client && client.close(),
      findOne: (query, model, options) =>
        findOne(client, query, model, options, id++),
      insertOne: (candidate, model) =>
        insertOne(client, candidate, model, id++),
    },
    emitter,
    name: 'websockets',
  };
};

export default maevaConnectMaevaSockets;
