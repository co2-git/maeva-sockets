import {Server as WSServer} from 'ws';
import pick from 'lodash/pick';

import * as logger from './logger';

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
  onMessage = (ws: WebSocket) => (message) =>
  new Promise(async (resolve, reject) => {
    let queueId;
    try {
      if (this.debug) {
        logger.log('New message', 'server', JSON.parse(message.data), 2);
      }
      if (message.type === 'message') {
        const data = JSON.parse(message.data.toString());
        const {action, query, model} = data.message;
        queueId = data.message.id;
        const {actions} = this.connection.connector;
        const {
          id,
          ids,
          document,
          documents,
          queries,
          updaters,
          options
        } = query;
        let connectorResponse;
        switch (action) {
        case 'count':
          connectorResponse = await actions.count(
            queries,
            model,
            options,
          );
          break;
        case 'findById':
          connectorResponse = await actions.findById(
            id,
            model,
            options,
          );
          break;
        case 'findByIds':
          connectorResponse = await actions.findByIds(
            ids,
            model,
            options,
          );
          break;
        case 'findOne':
          connectorResponse = await actions.findOne(
            queries,
            model,
            options,
          );
          break;
        case 'findMany':
          connectorResponse = await actions.findMany(
            queries,
            model,
            options,
          );
          break;
        case 'insertOne':
          connectorResponse = await actions.insertOne(
            document,
            model,
            options,
          );
          break;
        case 'insertMany':
          connectorResponse = await actions.insertMany(
            documents,
            model,
            options,
          );
          break;
        case 'removeById':
          connectorResponse = await actions.removeById(
            id,
            model,
            options,
          );
          break;
        case 'removeByIds':
          connectorResponse = await actions.removeByIds(
            ids,
            model,
            options,
          );
          break;
        case 'removeMany':
          connectorResponse = await actions.removeMany(
            queries,
            model,
            options,
          );
          break;
        case 'removeOne':
          connectorResponse = await actions.removeOne(
            queries,
            model,
            options,
          );
          break;
        case 'updateById':
          connectorResponse = await actions.updateById(
            id,
            updaters,
            model,
            options,
          );
          break;
        case 'updateByIds':
          connectorResponse = await actions.updateByIds(
            ids,
            updaters,
            model,
            options,
          );
          break;
        case 'updateOne':
          connectorResponse = await actions.updateOne(
            queries,
            updaters,
            model,
            options,
          );
          break;
        case 'updateMany':
          connectorResponse = await actions.updateMany(
            queries,
            updaters,
            model,
            options,
          );
          break;
        }
        const response = connectorResponse;
        if (this.debug) {
          logger.log('Got response from connector', 'server', {response}, 2);
        }
        ws.send(JSON.stringify({message: {response, id: queueId}}));
      }
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
      ws.send(JSON.stringify({message: {error: err, id: queueId}}));
      reject(error);
    }
  }).catch(error => {
    let err = pick(error, ['name', 'code', 'stack', 'message']);
    if (this.debug) {
      logger.log(
        'Error',
        'server',
        {...err, stack: err.stack.split(/\n/)},
        2
      );
    }
  });
}
