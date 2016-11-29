import 'babel-polyfill';
import {Server as WSServer} from 'ws';
import maeva from 'maeva';
import _ from 'lodash';
import colors from 'colors';

export default class Server extends WSServer {
  drivers = [];
  listeners = [];

  constructor(port, drivers = []) {
    super({port});
    this.drivers = drivers;
    this.on('connection', this.onConnection.bind(this));
  }

  log(message) {
    console.log(colors.grey(JSON.stringify({server: message}, null, 2)));
  }

  sendTo(ws, message) {
    ws.send(JSON.stringify(message));
  }

  onConnection(ws) {
    ws.maeva = {};
    console.log('new connexion');
    ws.on('message', async (messageString) => {
      try {
        this.log({messageString});
        const message = JSON.parse(messageString);
        const {action} = message;
        this.log({message});

        switch (action) {
        case 'auth': {
          const {auth} = message;
          ws.conn = await this.onAuth(ws, auth);
          console.log('connected to db server', auth);
          this.sendTo(ws, {connected: true});
        } break;

        case 'listen': {
          this.listeners.push({ws, ...message});
          this.sendTo(ws, {message: {addListener: message}});
        } break;

        case 'find':
        case 'insert': {
          const {
            collection,
            get,
            id,
            set,
          } = message;
          try {
            const results = await ws.conn.operations[action]({
              collection,
              get,
              set,
            });
            this.sendTo(ws, {
              id,
              action,
              results,
            });
          } catch (error) {
            console.log(error.stack);
            this.emit('error', error);
            this.sendTo(ws, {
              id,
              action,
              error: {
                message: error.name,
              },
            });
          }
        } break;
        }
      } catch (error) {
        console.log(error.stack);
      }
    });
  }

  onAuth(ws, auth) {
    return new Promise(async (resolve, reject) => {
      try {
        const {driver: driverName} = auth;
        const driver = _.find(this.drivers, {name: driverName});
        if (!driver) {
          throw new Error(`Driver not found: ${driverName}`);
        }
        const conn = await maeva.connect(driver.connect(auth.url));
        resolve(conn);
      } catch (error) {
        reject(error);
      }
    });
  }
}
