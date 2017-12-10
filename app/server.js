import {Server as WSServer} from 'ws';
import pick from 'lodash/pick';

import * as logger from './lib/logger';
import send from './lib/send';

try {
  require('babel-polyfill');
} catch (error) {}

export default class Server extends WSServer {

  static id = 0;

  connection;
  debug: boolean = false;
  listeners = [];
  name: string;
  port: number;
  sockets: MaevaSocketsSocket[] = [];

  constructor({connector, name, port, debug = false}) {
    if (!port) {
      port = 3000;
    }
    super({
      perMessageDeflate: false,
      port,
    });
    this.port = port;
    this.name = name;
    this.debug = Boolean(debug);
    this.on('connection', this.onConnection);
    if (this.debug) {
      logger.log('Server started', 'server', {port});
    }
    setTimeout(() => this.connectToDB(connector));
  }

  connectToDB = (connector: MaevaConnector): Promise<void> =>
    new Promise(async (resolve, reject) => {
      try {
        this.connection = await connector();
        if (this.debug) {
          logger.log(
            'Connector connected', 'server', this.connection.connector.name
          );
        }
        for (const {meta, socket} of this.sockets) {
          socket.send(JSON.stringify({
            connectionInfo: {
              connectorIdName: this.connection.connector.idName,
              socket: {meta}
            }
          }));
        }
        resolve();
      } catch (error) {
        console.log('OH MY GOD');
        reject(error);
      }
    });

  onConnection = (socket: WebSocket) => {
    try {
      const meta = {id: Server.id ++};
      if (this.debug) {
        logger.log('New socket', 'server', `#${meta.id}`);
      }
      this.sockets.push({socket, meta});
      socket.send(JSON.stringify({
        connectionInfo: {
          connectorIdName: this.connection.connector.idName,
          socket: {meta}
        }
      }));
      socket.onmessage = this.onMessage(socket);
    } catch (error) {
      if (this.debug) {
        logger.log('Error', 'server', error.stack.split(/\n/), 2);
      }
    }
  }

  // Sockets server receives a new request from front client
  onMessage = (ws: WebSocket) => (async (message: MessageEvent) => {
    if (this.debug) {
      logger.log('New message', 'server', JSON.parse(message.data), 2);
    }
    if (message.type === 'message') {
      const data = JSON.parse(message.data.toString());
      const {action, socketId, query, model} = data;
      const {actions} = this.connection.connector;
      const {
        id: $id,
        ids,
        document,
        documents,
        queries,
        updaters,
        options
      } = query;
      let connectorResponse;
      try {
        const queryQueries = [
          'count',
          'findOne', 'findMany',
          'removeOne', 'removeMany',
        ];
        for (const statement of queryQueries) {
          if (statement === action) {
            connectorResponse = await actions[action](
              queries,
              model,
              options,
            );
          }
        }
        const idQueries = ['findById', 'removeById'];
        for (const statement of idQueries) {
          if (statement === action) {
            connectorResponse = await actions[action](
              $id,
              model,
              options,
            );
          }
        }
        const idsQueries = ['findByIds', 'removeByIds'];
        for (const statement of idsQueries) {
          if (statement === action) {
            connectorResponse = await actions[action](
              ids,
              model,
              options,
            );
          }
        }
        const insertQueries = ['insertOne', 'insertMany'];
        for (const statement of insertQueries) {
          if (statement === action) {
            connectorResponse = await actions[action](
              document || documents,
              model,
              options,
            );
          }
        }
        const updateQueries = ['updateOne', 'updateMany'];
        for (const statement of updateQueries) {
          if (statement === action) {
            connectorResponse = await actions[action](
              queries,
              updaters,
              model,
              options,
            );
          }
        }
        const updateIdQueries = ['updateById', 'updateByIds'];
        for (const statement of updateIdQueries) {
          if (statement === action) {
            connectorResponse = await actions[action](
              $id || ids,
              updaters,
              model,
              options,
            );
          }
        }
        const response = connectorResponse;
        if (this.debug) {
          logger.log('Got response from connector', 'server', {response}, 2);
        }
        send(ws, {response, socketId});
      } catch (error) {
        let err = pick(error, ['name', 'code', 'stack', 'message']);
        if (this.debug) {
          logger.log(
            'Error',
            'server',
            {...err, stack: err.stack.split(/\n/)},
            2
          );
        }
        send(ws, {error: err, socketId});
      }
    }
  });
}
