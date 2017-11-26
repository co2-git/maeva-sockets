/* globals describe before it */
import WS from 'ws';
import * as maeva from 'maeva';
import mongodb from 'maeva-mongodb';

import sockets, {Server} from '..';

global.WebSocket = WS;

const model = maeva.model('foo', {score: Number, _id: String});

let conn;

describe('Maeva Sockets', () => {
  before(async () => {
    await new Promise((resolve, reject) => {
      try {
        const server = new Server({
          connector: () => maeva.connect(
            mongodb('mongodb://localhost:7007/maeva-sockets')
          ),
          name: 'wallets-mongodb',
          port: 12345,
          debug: false,
        });
        resolve(server);
      } catch (error) {
        reject(error);
      }
    });
  });
  it('should connect', () => {
    const connector = sockets('ws://localhost:12345');
    conn = maeva.connect(connector);
  });
  it('should insert one', () => new Promise(async (resolve, reject) => {
    try {
      const inserted = await maeva.insertOne(
        model,
        {score: 0},
        {connection: conn}
      );
      console.log({inserted});
      resolve();
    } catch (error) {
      reject(error);
    }
  }));
});
