'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

require('babel-polyfill');

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _find = require('lodash/find');

var _find2 = _interopRequireDefault(_find);

var _logger = require('./logger');

var logger = _interopRequireWildcard(_logger);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* globals WebSocket */
var connector = function connector(url) {
  var connectorOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var emitter = new _events2.default();
  var client = void 0;
  var connectorIdName = void 0;
  var socketId = '?';
  var queue = [];
  var queueId = 0;
  var connect = function connect() {
    client = new WebSocket(url);
    client.onopen = function () {
      // ...
    };
    client.onerror = function (error) {
      // if (client.readyState !== 1 && clientStatus === 'disconnected') {
      //   emitter.emit('disconnected');
      // }
      console.log(error);
    };
    client.onclose = function () {
      emitter.emit('disconnected');
    };
    client.onmessage = function (event) {
      if (connectorOptions.debug) {
        logger.log('New message', socketId, JSON.parse(event.data), 2);
      }
      if (event.type === 'message') {
        var parsedMessage = JSON.parse(event.data.toString());
        var connectionInfo = parsedMessage.connectionInfo;

        if (connectionInfo) {
          connectorIdName = connectionInfo.connectorIdName;
          socketId = connectionInfo.socket.meta.id;
          if (connectorIdName && socketId !== '?') {
            emitter.emit('connected');
          }
        } else if (parsedMessage.message) {
          try {
            var _parsedMessage$messag = parsedMessage.message,
                error = _parsedMessage$messag.error,
                response = _parsedMessage$messag.response,
                id = _parsedMessage$messag.id;

            var item = (0, _find2.default)(queue, { id: id });
            if (!item) {
              if (connectorOptions.debug) {
                logger.log('Could not find queue item #' + id, socketId, queue, 2);
              }
            } else if (error) {
              var err = new Error(error.message);
              err.code = error.code;
              err.stack = error.stack;
              item.reject(err);
            } else {
              item.resolve(response);
            }
          } catch (error) {
            console.log(error.stack);
          }
        }
      }
    };
  };
  var action = function action(name, query, model) {
    return new Promise(function (resolve, reject) {
      try {
        var id = queueId++;
        var message = {
          action: name,
          model: model,
          query: query,
          id: id
        };
        queue.push({
          action: name,
          id: id,
          model: model.name,
          query: query,
          reject: reject,
          resolve: resolve,
          socketId: socketId
        });
        client.send(JSON.stringify({ message: message }));
      } catch (error) {
        reject(error);
      }
    });
  };
  return {
    actions: {
      connect: connect,
      count: function count(queries, model) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        return action('count', { queries: queries, options: options }, model);
      },
      disconnect: function disconnect() {
        return client && client.disconnect();
      },
      findById: function findById(id, model) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        return action('findById', { id: id, options: options }, model);
      },
      findByIds: function findByIds(ids, model) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        return action('findByIds', { ids: ids, options: options }, model);
      },
      findOne: function findOne(queries, model) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        return action('findOne', { queries: queries, options: options }, model);
      },
      findMany: function findMany(queries, model) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        return action('findMany', { queries: queries, options: options }, model);
      },
      insertOne: function insertOne(document, model) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        return action('insertOne', { document: document, options: options }, model);
      },
      insertMany: function insertMany(documents, model) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        return action('insertMany', { documents: documents, options: options }, model);
      },
      removeById: function removeById(id, model) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        return action('removeById', { id: id, options: options }, model);
      },
      removeByIds: function removeByIds(ids, model) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        return action('removeByIds', { ids: ids, options: options }, model);
      },
      removeOne: function removeOne(queries, model) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        return action('removeOne', { queries: queries, options: options }, model);
      },
      removeMany: function removeMany(queries, model) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        return action('removeMany', { queries: queries, options: options }, model);
      },
      updateById: function updateById(id, updaters, model) {
        var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
        return action('updateById', { id: id, updaters: updaters, options: options }, model);
      },
      updateByIds: function updateByIds(ids, updaters, model) {
        var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
        return action('updateByIds', { ids: ids, updaters: updaters, options: options }, model);
      },
      updateOne: function updateOne(queries, updaters, model) {
        var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
        return action('updateOne', { queries: queries, updaters: updaters, options: options }, model);
      },
      updateMany: function updateMany(queries, updaters, model) {
        var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
        return action('updateMany', { queries: queries, updaters: updaters, options: options }, model);
      }
    },
    emitter: emitter,
    name: 'websockets',
    idName: function idName() {
      return connectorIdName;
    }
  };
};

exports.default = connector;