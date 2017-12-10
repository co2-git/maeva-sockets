/* globals WebSocket */
import 'babel-polyfill';
import EventEmitter from 'events';
import filter from 'lodash/filter';
import reject from 'lodash/reject';

import * as logger from './lib/logger';

const connector = (url, connectorOptions = {}) => {
  const emitter = new EventEmitter();
  let client;
  let connectorIdName;
  let socketId = '?';
  let queue = [];
  let queueId = 0;
  const connect = () => {
    client = new WebSocket(url);
    client.onopen = () => {
      // ...
    };
    client.onerror = (error) => {
      // if (client.readyState !== 1 && clientStatus === 'disconnected') {
      //   emitter.emit('disconnected');
      // }
      console.log(error);
    };
    client.onclose = () => {
      emitter.emit('disconnected');
    };
    client.onmessage = (event) => {
      if (connectorOptions.debug) {
        logger.log('New message', socketId, JSON.parse(event.data), 2);
      }
      if (event.type === 'message') {
        const parsedMessage = JSON.parse(event.data.toString());
        const {connectionInfo} = parsedMessage;
        if (connectionInfo) {
          connectorIdName = connectionInfo.connectorIdName;
          socketId = connectionInfo.socket.meta.id;
          if (connectorIdName && socketId !== '?') {
            emitter.emit('connected');
          }
        } else if (parsedMessage.message) {
          try {
            const {
              message: {error, response, socketId: messageSocketId}
            } = parsedMessage;
            if (isNaN(messageSocketId)) {
              throw new Error('Message has no socket id');
            }
            const items = filter(queue, {socketId});
            if (!items.length) {
              if (connectorOptions.debug) {
                logger.log(
                  'Queue empty for socket id',
                  socketId,
                  queue,
                  2,
                );
              }
            } else {
              for (const item of items) {
                if (error) {
                  let err = new Error(error.message);
                  err.code = error.code;
                  err.stack = error.stack;
                  item.reject(err);
                } else {
                  item.resolve(response);
                }
                queue = reject(queue, {id: item.id});
              }
            }
          } catch (error) {
            console.log(error.stack);
          }
        }
      }
    };
  };
  const action = (name, query, model) =>
  new Promise((resolve, rejectPromise) => {
    try {
      const message = {
        action: name,
        model,
        query,
        socketId,
      };
      queue.push({
        id: queueId++,
        reject: rejectPromise,
        resolve,
        socketId,
      });
      client.send(JSON.stringify(message));
    } catch (error) {
      rejectPromise(error);
    }
  });
  return {
    actions: {
      connect,
      count: (queries, model, options = {}) =>
        action('count', {queries, options}, model),
      disconnect: () => client && client.disconnect(),
      findById: (id, model, options = {}) =>
        action('findById', {id, options}, model),
      findByIds: (ids, model, options = {}) =>
        action('findByIds', {ids, options}, model),
      findOne: (queries, model, options = {}) =>
        action('findOne', {queries, options}, model),
      findMany: (queries, model, options = {}) =>
        action('findMany', {queries, options}, model),
      insertOne: (document, model, options = {}) =>
        action('insertOne', {document, options}, model),
      insertMany: (documents, model, options = {}) =>
        action('insertMany', {documents, options}, model),
      removeById: (id, model, options = {}) =>
        action('removeById', {id, options}, model),
      removeByIds: (ids, model, options = {}) =>
        action('removeByIds', {ids, options}, model),
      removeOne: (queries, model, options = {}) =>
        action('removeOne', {queries, options}, model),
      removeMany: (queries, model, options = {}) =>
        action('removeMany', {queries, options}, model),
      updateById: (id, updaters, model, options = {}) =>
        action('updateById', {id, updaters, options}, model),
      updateByIds: (ids, updaters, model, options = {}) =>
        action('updateByIds', {ids, updaters, options}, model),
      updateOne: (queries, updaters, model, options = {}) =>
        action('updateOne', {queries, updaters, options}, model),
      updateMany: (queries, updaters, model, options = {}) =>
        action('updateMany', {queries, updaters, options}, model),
    },
    emitter,
    name: 'websockets',
    idName: () => connectorIdName,
  };
};

export default connector;
