'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _constants = require('./constants');

var constants = _interopRequireWildcard(_constants);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var relay = function relay(emitter, server, db, dbStatus, client, message) {
  new Promise(function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(resolve, reject) {
      var queueId, parsed, _parsed$message, action, query, model, actions, id, ids, document, documents, queries, updaters, options, connectorResponse, response, out;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              queueId = void 0;
              _context.prev = 1;

              emitter.emit(constants.SERVER_INCOMING_MESSAGE_EVENT, { message: message, client: client });
              parsed = JSON.parse(message);
              _parsed$message = parsed.message, action = _parsed$message.action, query = _parsed$message.query, model = _parsed$message.model;

              queueId = parsed.message.id;
              actions = db.connector.actions;
              id = query.id, ids = query.ids, document = query.document, documents = query.documents, queries = query.queries, updaters = query.updaters, options = query.options;
              connectorResponse = void 0;
              _context.t0 = action;
              _context.next = _context.t0 === 'count' ? 12 : _context.t0 === 'findById' ? 16 : _context.t0 === 'findByIds' ? 20 : _context.t0 === 'findOne' ? 24 : _context.t0 === 'findMany' ? 28 : _context.t0 === 'insertOne' ? 32 : _context.t0 === 'insertMany' ? 36 : _context.t0 === 'removeById' ? 40 : _context.t0 === 'removeByIds' ? 44 : _context.t0 === 'removeMany' ? 48 : _context.t0 === 'removeOne' ? 52 : _context.t0 === 'updateById' ? 56 : _context.t0 === 'updateByIds' ? 60 : _context.t0 === 'updateOne' ? 64 : _context.t0 === 'updateMany' ? 68 : 72;
              break;

            case 12:
              _context.next = 14;
              return actions.count(queries, model, options);

            case 14:
              connectorResponse = _context.sent;
              return _context.abrupt('break', 72);

            case 16:
              _context.next = 18;
              return actions.findById(id, model, options);

            case 18:
              connectorResponse = _context.sent;
              return _context.abrupt('break', 72);

            case 20:
              _context.next = 22;
              return actions.findByIds(ids, model, options);

            case 22:
              connectorResponse = _context.sent;
              return _context.abrupt('break', 72);

            case 24:
              _context.next = 26;
              return actions.findOne(queries, model, options);

            case 26:
              connectorResponse = _context.sent;
              return _context.abrupt('break', 72);

            case 28:
              _context.next = 30;
              return actions.findMany(queries, model, options);

            case 30:
              connectorResponse = _context.sent;
              return _context.abrupt('break', 72);

            case 32:
              _context.next = 34;
              return actions.insertOne(document, model, options);

            case 34:
              connectorResponse = _context.sent;
              return _context.abrupt('break', 72);

            case 36:
              _context.next = 38;
              return actions.insertMany(documents, model, options);

            case 38:
              connectorResponse = _context.sent;
              return _context.abrupt('break', 72);

            case 40:
              _context.next = 42;
              return actions.removeById(id, model, options);

            case 42:
              connectorResponse = _context.sent;
              return _context.abrupt('break', 72);

            case 44:
              _context.next = 46;
              return actions.removeByIds(ids, model, options);

            case 46:
              connectorResponse = _context.sent;
              return _context.abrupt('break', 72);

            case 48:
              _context.next = 50;
              return actions.removeMany(queries, model, options);

            case 50:
              connectorResponse = _context.sent;
              return _context.abrupt('break', 72);

            case 52:
              _context.next = 54;
              return actions.removeOne(queries, model, options);

            case 54:
              connectorResponse = _context.sent;
              return _context.abrupt('break', 72);

            case 56:
              _context.next = 58;
              return actions.updateById(id, updaters, model, options);

            case 58:
              connectorResponse = _context.sent;
              return _context.abrupt('break', 72);

            case 60:
              _context.next = 62;
              return actions.updateByIds(ids, updaters, model, options);

            case 62:
              connectorResponse = _context.sent;
              return _context.abrupt('break', 72);

            case 64:
              _context.next = 66;
              return actions.updateOne(queries, updaters, model, options);

            case 66:
              connectorResponse = _context.sent;
              return _context.abrupt('break', 72);

            case 68:
              _context.next = 70;
              return actions.updateMany(queries, updaters, model, options);

            case 70:
              connectorResponse = _context.sent;
              return _context.abrupt('break', 72);

            case 72:
              response = connectorResponse;

              emitter.emit(constants.SERVER_GOT_RESPONSE_FROM_DB_EVENT, response);
              out = { message: { response: response, id: queueId } };

              emitter.emit(constants.SERVER_OUTCOMING_MESSAGE_EVENT, out);
              client.send(JSON.stringify(out));
              _context.next = 83;
              break;

            case 79:
              _context.prev = 79;
              _context.t1 = _context['catch'](1);

              client.send(JSON.stringify({
                message: {
                  error: { message: _context.t1.message, stack: _context.t1.stack },
                  id: queueId
                } }));
              reject(_context.t1);

            case 83:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined, [[1, 79]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }()).catch(function (error) {
    emitter.emit('error', error);
  });
};

exports.default = relay;