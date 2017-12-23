'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _ws = require('ws');

var _pick = require('lodash/pick');

var _pick2 = _interopRequireDefault(_pick);

var _logger = require('./logger');

var logger = _interopRequireWildcard(_logger);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

try {
  require('babel-polyfill');
} catch (error) {}

var Server = function (_WSServer) {
  _inherits(Server, _WSServer);

  function Server(_ref) {
    var connector = _ref.connector,
        name = _ref.name,
        port = _ref.port,
        _ref$debug = _ref.debug,
        debug = _ref$debug === undefined ? false : _ref$debug;

    _classCallCheck(this, Server);

    if (!port) {
      port = 3000;
    }

    var _this = _possibleConstructorReturn(this, (Server.__proto__ || Object.getPrototypeOf(Server)).call(this, {
      perMessageDeflate: false,
      port: port
    }));

    _initialiseProps.call(_this);

    _this.port = port;
    _this.name = name;
    _this.debug = Boolean(debug);
    _this.on('connection', _this.onConnection);
    if (_this.debug) {
      logger.log('Server started', 'server', { port: port });
    }
    setTimeout(function () {
      return _this.connectToDB(connector);
    });
    return _this;
  }

  // Sockets server receives a new request from front client


  return Server;
}(_ws.Server);

Server.id = 0;

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.debug = false;
  this.listeners = [];
  this.sockets = [];

  this.connectToDB = function (connector) {
    return new Promise(function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(resolve, reject) {
        var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _ref4, meta, socket;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return connector();

              case 3:
                _this2.connection = _context.sent;

                if (_this2.debug) {
                  logger.log('Connector connected', 'server', _this2.connection.connector.name);
                }
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context.prev = 8;
                for (_iterator = _this2.sockets[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  _ref4 = _step.value;
                  meta = _ref4.meta, socket = _ref4.socket;

                  socket.send(JSON.stringify({
                    connectionInfo: {
                      connectorIdName: _this2.connection.connector.idName,
                      socket: { meta: meta }
                    }
                  }));
                }
                _context.next = 16;
                break;

              case 12:
                _context.prev = 12;
                _context.t0 = _context['catch'](8);
                _didIteratorError = true;
                _iteratorError = _context.t0;

              case 16:
                _context.prev = 16;
                _context.prev = 17;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 19:
                _context.prev = 19;

                if (!_didIteratorError) {
                  _context.next = 22;
                  break;
                }

                throw _iteratorError;

              case 22:
                return _context.finish(19);

              case 23:
                return _context.finish(16);

              case 24:
                resolve();
                _context.next = 31;
                break;

              case 27:
                _context.prev = 27;
                _context.t1 = _context['catch'](0);

                console.log('OH MY GOD');
                reject(_context.t1);

              case 31:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this2, [[0, 27], [8, 12, 16, 24], [17,, 19, 23]]);
      }));

      return function (_x, _x2) {
        return _ref2.apply(this, arguments);
      };
    }());
  };

  this.onConnection = function (socket) {
    try {
      var meta = { id: Server.id++ };
      if (_this2.debug) {
        logger.log('New socket', 'server', '#' + meta.id);
      }
      _this2.sockets.push({ socket: socket, meta: meta });
      socket.send(JSON.stringify({
        connectionInfo: {
          connectorIdName: _this2.connection.connector.idName,
          socket: { meta: meta }
        }
      }));
      socket.onmessage = _this2.onMessage(socket);
    } catch (error) {
      if (_this2.debug) {
        logger.log('Error', 'server', error.stack.split(/\n/), 2);
      }
    }
  };

  this.onMessage = function (ws) {
    return function (message) {
      return new Promise(function () {
        var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(resolve, reject) {
          var queueId, data, _data$message, action, query, model, actions, id, ids, document, documents, queries, updaters, options, connectorResponse, response, err;

          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  queueId = void 0;
                  _context2.prev = 1;

                  if (_this2.debug) {
                    logger.log('New message', 'server', JSON.parse(message.data), 2);
                  }

                  if (!(message.type === 'message')) {
                    _context2.next = 76;
                    break;
                  }

                  data = JSON.parse(message.data.toString());
                  _data$message = data.message, action = _data$message.action, query = _data$message.query, model = _data$message.model;

                  queueId = data.message.id;
                  actions = _this2.connection.connector.actions;
                  id = query.id, ids = query.ids, document = query.document, documents = query.documents, queries = query.queries, updaters = query.updaters, options = query.options;
                  connectorResponse = void 0;
                  _context2.t0 = action;
                  _context2.next = _context2.t0 === 'count' ? 13 : _context2.t0 === 'findById' ? 17 : _context2.t0 === 'findByIds' ? 21 : _context2.t0 === 'findOne' ? 25 : _context2.t0 === 'findMany' ? 29 : _context2.t0 === 'insertOne' ? 33 : _context2.t0 === 'insertMany' ? 37 : _context2.t0 === 'removeById' ? 41 : _context2.t0 === 'removeByIds' ? 45 : _context2.t0 === 'removeMany' ? 49 : _context2.t0 === 'removeOne' ? 53 : _context2.t0 === 'updateById' ? 57 : _context2.t0 === 'updateByIds' ? 61 : _context2.t0 === 'updateOne' ? 65 : _context2.t0 === 'updateMany' ? 69 : 73;
                  break;

                case 13:
                  _context2.next = 15;
                  return actions.count(queries, model, options);

                case 15:
                  connectorResponse = _context2.sent;
                  return _context2.abrupt('break', 73);

                case 17:
                  _context2.next = 19;
                  return actions.findById(id, model, options);

                case 19:
                  connectorResponse = _context2.sent;
                  return _context2.abrupt('break', 73);

                case 21:
                  _context2.next = 23;
                  return actions.findByIds(ids, model, options);

                case 23:
                  connectorResponse = _context2.sent;
                  return _context2.abrupt('break', 73);

                case 25:
                  _context2.next = 27;
                  return actions.findOne(queries, model, options);

                case 27:
                  connectorResponse = _context2.sent;
                  return _context2.abrupt('break', 73);

                case 29:
                  _context2.next = 31;
                  return actions.findMany(queries, model, options);

                case 31:
                  connectorResponse = _context2.sent;
                  return _context2.abrupt('break', 73);

                case 33:
                  _context2.next = 35;
                  return actions.insertOne(document, model, options);

                case 35:
                  connectorResponse = _context2.sent;
                  return _context2.abrupt('break', 73);

                case 37:
                  _context2.next = 39;
                  return actions.insertMany(documents, model, options);

                case 39:
                  connectorResponse = _context2.sent;
                  return _context2.abrupt('break', 73);

                case 41:
                  _context2.next = 43;
                  return actions.removeById(id, model, options);

                case 43:
                  connectorResponse = _context2.sent;
                  return _context2.abrupt('break', 73);

                case 45:
                  _context2.next = 47;
                  return actions.removeByIds(ids, model, options);

                case 47:
                  connectorResponse = _context2.sent;
                  return _context2.abrupt('break', 73);

                case 49:
                  _context2.next = 51;
                  return actions.removeMany(queries, model, options);

                case 51:
                  connectorResponse = _context2.sent;
                  return _context2.abrupt('break', 73);

                case 53:
                  _context2.next = 55;
                  return actions.removeOne(queries, model, options);

                case 55:
                  connectorResponse = _context2.sent;
                  return _context2.abrupt('break', 73);

                case 57:
                  _context2.next = 59;
                  return actions.updateById(id, updaters, model, options);

                case 59:
                  connectorResponse = _context2.sent;
                  return _context2.abrupt('break', 73);

                case 61:
                  _context2.next = 63;
                  return actions.updateByIds(ids, updaters, model, options);

                case 63:
                  connectorResponse = _context2.sent;
                  return _context2.abrupt('break', 73);

                case 65:
                  _context2.next = 67;
                  return actions.updateOne(queries, updaters, model, options);

                case 67:
                  connectorResponse = _context2.sent;
                  return _context2.abrupt('break', 73);

                case 69:
                  _context2.next = 71;
                  return actions.updateMany(queries, updaters, model, options);

                case 71:
                  connectorResponse = _context2.sent;
                  return _context2.abrupt('break', 73);

                case 73:
                  response = connectorResponse;

                  if (_this2.debug) {
                    logger.log('Got response from connector', 'server', { response: response }, 2);
                  }
                  ws.send(JSON.stringify({ message: { response: response, id: queueId } }));

                case 76:
                  _context2.next = 84;
                  break;

                case 78:
                  _context2.prev = 78;
                  _context2.t1 = _context2['catch'](1);
                  err = (0, _pick2.default)(_context2.t1, ['name', 'code', 'stack', 'message']);

                  if (_this2.debug) {
                    logger.log('Error', 'server', _extends({}, err, { stack: err.stack.split(/\n/) }), 2);
                  }
                  ws.send(JSON.stringify({ message: { error: err, id: queueId } }));
                  reject(_context2.t1);

                case 84:
                case 'end':
                  return _context2.stop();
              }
            }
          }, _callee2, _this2, [[1, 78]]);
        }));

        return function (_x3, _x4) {
          return _ref5.apply(this, arguments);
        };
      }()).catch(function (error) {
        var err = (0, _pick2.default)(error, ['name', 'code', 'stack', 'message']);
        if (_this2.debug) {
          logger.log('Error', 'server', _extends({}, err, { stack: err.stack.split(/\n/) }), 2);
        }
      });
    };
  };
};

exports.default = Server;