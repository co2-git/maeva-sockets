
import {Server as WSServer} from 'ws';
import send from './send';
import desanitize from './desanitize';
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
        resolve();
      } catch (error) {
        reject(error);
      }
    });

  onConnection = (socket: WebSocket) => {
    const meta = {id: Server.id ++};
    if (this.debug) {
      logger.log('New socket', 'server', `#${meta.id}`);
    }
    this.sockets.push({socket, meta});
    socket.send(JSON.stringify({
      connectionInfo: {
        connector: {
          id: {
            name: this.connection.connector.id.name,
          }
        },
        socket: {
          meta
        }
      }
    }));
    socket.onmessage = this.onMessage(socket);
  }

  // Sockets server receives a new request from front client
  onMessage = (ws: WebSocket) => (async (message: MessageEvent) => {
    if (this.debug) {
      logger.log('New message', 'server', JSON.parse(message.data), 2);
    }
    if (message.type === 'message') {
      const data = JSON.parse(message.data.toString());
      const {action} = data;
      const {actions, id: connectorId} = this.connection.connector;

      if (action === 'validate') {
        if (this.debug) {
          logger.log('Validate request', 'server', data, 2);
        }
        try {
          await connectorId.type.validate(...data.args);
          ws.send(JSON.stringify({validated: data.validateId, result: true}));
        } catch (error) {
          ws.send(JSON.stringify({validated: data.validateId, result: error}));
        }
      } else if (action === 'convert') {
        if (this.debug) {
          logger.log('Convert request', 'server', data, 2);
        }
        const converted = await connectorId.type.convert(...data.args);
        ws.send(
          JSON.stringify({converted: data.convertId, result: converted})
        );
      } else {
        const {id, query, model} = data;
        let connectorResponse;

        if (action === 'insertOne') {
          const candidate = desanitize(query.set);
          connectorResponse = await actions.insertOne(
            candidate,
            model,
          );
        } else if (action === 'insertMany') {
          const documents = query.set.map(desanitize);
          connectorResponse = await actions.insertMany(
            documents,
            model,
          );
        } else if (action === 'findOne') {
          const candidate = desanitize(query.get);
          connectorResponse = await actions.findOne(
            candidate,
            model,
          );
        } else if (action === 'findById') {
          const $id = query.get;
          connectorResponse = await actions.findById(
            $id,
            model,
          );
        } else if (action === 'findMany') {
          const candidate = desanitize(query.get);
          connectorResponse = await actions.findMany(
            candidate,
            model,
          );
        } else if (action === 'updateById') {
          const $id = query.get;
          const set = desanitize(query.set);
          connectorResponse = await actions.updateById(
            $id,
            set,
            model,
          );
        }

        const response: MaevaSocketsServerResponse = connectorResponse;
        if (this.debug) {
          logger.log('Got response from connector', 'server', {response}, 2);
        }
        send(ws, {response, id}, this);
      }
    }
  });
}
