'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _url = require('url');

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _maeva = require('maeva');

var data = _interopRequireWildcard(_maeva);

var _relay = require('./relay');

var _relay2 = _interopRequireDefault(_relay);

var _constants = require('./constants');

var constants = _interopRequireWildcard(_constants);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var start = function start(url) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var emitter = new _events2.default();
  setTimeout(function () {
    var host = options.host || 'localhost';
    var port = options.port || 9999;
    var path = options.pathname || '/';

    if (typeof url === 'string') {
      var parsedUrl = new _url.URL(url);
      host = parsedUrl.hostname;
      port = parsedUrl.port;
      path = parsedUrl.pathname;
    }

    var server = new _ws2.default.Server({ host: host, path: path, port: port });

    var dbStatus = constants.SERVER_IDDLE_EVENT;
    var db = void 0;

    server.on('close', function () {
      emitter.emit(constants.SERVER_CLOSED_EVENT);
    });

    server.on('connection', function (client) {
      if (dbStatus === 'connected') {
        client.send(JSON.stringify({
          connectionInfo: {
            connected: true,
            connectorIdName: db.connector.idName
          }
        }));
      } else {
        client.send(JSON.stringify({
          connectionInfo: {
            connected: false
          }
        }));
      }
      client.on('message', function (message) {
        return (0, _relay2.default)(emitter, server, db, dbStatus, client, message);
      });
    });

    server.on('error', function (error) {
      return emitter.emit('error', error);
    });

    server.on('listening', function (conn) {
      emitter.emit(constants.SERVER_LISTENING_EVENT, conn);

      db = data.connect(options.connector());

      db.emitter.on('error', function (error) {
        emitter.emit('error', error);
      });

      db.emitter.on('connected', function () {
        dbStatus = 'connected';
        emitter.emit(constants.SERVER_CONNECTED_EVENT);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = server.clients[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var client = _step.value;

            if (client.readyState === _ws2.default.OPEN) {
              client.send(JSON.stringify({
                connectionInfo: {
                  connected: true,
                  connectorIdName: db.connector.idName
                }
              }));
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      });

      db.emitter.on('disconnected', function () {
        dbStatus = 'disconnected';
        emitter.emit(constants.SERVER_DISCONNECTED_EVENT);
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = server.clients[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var client = _step2.value;

            if (client.readyState === _ws2.default.OPEN) {
              client.send(JSON.stringify({
                connectionInfo: {
                  disconnected: true
                }
              }));
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      });
    });

    emitter.on('end', function () {
      return server.close;
    });
  }, 2000);
  return emitter;
};

exports.default = {
  start: start
};