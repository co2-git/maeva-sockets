// @flow
import {Server as WSServer} from 'ws';
import send from './helpers/send';
import desanitize from './desanitize';

try {
  require('babel-polyfill');
} catch (error) {}

export default class Server extends WSServer {

  static id = 0;

  connector: Function;
  listeners = [];
  name: string;
  port: number;
  sockets: MaevaSocketsSocket[] = [];

  constructor({connector, name, port}: MaevaSocketsServerOptions) {
    if (!port) {
      throw new Error('Missing port');
    }
    super({
      perMessageDeflate: false,
      port,
    });
    this.port = port;
    this.name = name;
    this.on('connection', this.onConnection);
    this.connectToDB(connector);
    console.log(`Server started on port ${port}`);
  }

  connectToDB = (connector: MaevaConnector): Promise<void> =>
    new Promise(async (resolve, reject) => {
      try {
        console.log(connector.toString());
        this.connection = await connector();
        console.log('conn', this.connection);
        resolve();
      } catch (error) {
        reject(error);
      }
    });

  onConnection = (socket: WebSocket) => {
    console.log({socket});
    const meta = {id: Server.id ++};
    this.sockets.push({socket, meta});
    socket.onmessage = this.onMessage(socket);
  }

  // Sockets server receives a new request from front client
  onMessage = (ws: WebSocket) => (async (message: MessageEvent) => {
    console.log({message});
    if (message.type === 'message') {
      const {action, id, query, model} = JSON.parse(message.data.toString());
      const {actions} = this.connection.connector;
      console.log({action, actions, id, query, model});
      let connectorResponse;
      if (action === 'insertOne') {
        const candidate = desanitize(query.set);
        console.log({desanitized: candidate});
        connectorResponse = await actions.insertOne(
          candidate,
          model,
        );
      } else if (action === 'findOne') {
        const candidate = desanitize(query.get);
        console.log({desanitized: candidate});
        connectorResponse = await actions.findOne(
          candidate,
          model,
        );
      }

      // const connectorResponse = await actions[action](query);
      const response: MaevaSocketsServerResponse = JSON.stringify({
        id,
        connectorResponse,
      });
      console.log({response});
      send(ws, response);
    }
  });
}
