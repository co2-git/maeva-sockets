// @flow
import {Server as WSServer} from 'ws';
import send from './send';
import desanitize from './desanitize';

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

  constructor({connector, name, port, debug = false}: MaevaSocketsServerOptions) {
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
      console.log(`Server started on port ${port}`);
    }
    setTimeout(() => this.connectToDB(connector));
  }

  connectToDB = (connector: MaevaConnector): Promise<void> =>
    new Promise(async (resolve, reject) => {
      try {
        this.connection = await connector();
        resolve();
      } catch (error) {
        reject(error);
      }
    });

  onConnection = (socket: WebSocket) => {
    if (this.debug) {
      console.log('New socket connection');
    }
    const meta = {id: Server.id ++};
    this.sockets.push({socket, meta});
    socket.send(JSON.stringify({
      connectionInfo: {
        connector: {
          id: {
            name: this.connection.connector.id.name,
          }
        }
      }
    }));
    socket.onmessage = this.onMessage(socket);
  }

  // Sockets server receives a new request from front client
  onMessage = (ws: WebSocket) => (async (message: MessageEvent) => {
    if (this.debug) {
      console.log('New message', message.data);
    }
    if (message.type === 'message') {
      const {action, id, query, model} = JSON.parse(message.data.toString());
      const {actions} = this.connection.connector;
      if (this.debug) {
        console.log({action, actions, id, query, model});
      }
      let connectorResponse;

      if (action === 'insertOne') {
        const candidate = desanitize(query.set);
        if (this.debug) {
          console.log({desanitized: candidate});
        }
        connectorResponse = await actions.insertOne(
          candidate,
          model,
        );
      } else if (action === 'findOne') {
        const candidate = desanitize(query.get);
        if (this.debug) {
          console.log({desanitized: candidate});
        }
        connectorResponse = await actions.findOne(
          candidate,
          model,
        );
      }

      const response: MaevaSocketsServerResponse = connectorResponse;
      if (this.debug) {
        console.log({response});
      }
      send(ws, {response, id}, this);
    }
  });
}
