import {URL} from 'url';
import WebSocket from 'ws';
import Emitter from 'events';
import * as data from 'maeva';

import relay from './relay';
import * as constants from './constants';

const start = (url, options = {}) => {
  const emitter = new Emitter();
  setTimeout(() => {
    let host = options.host || 'localhost';
    let port = options.port || 9999;
    let path = options.pathname || '/';

    if (typeof url === 'string') {
      const parsedUrl = new URL(url);
      host = parsedUrl.hostname;
      port = parsedUrl.port;
      path = parsedUrl.pathname;
    }

    const server = new WebSocket.Server({host, path, port});

    let dbStatus = constants.SERVER_IDDLE_EVENT;
    let db;

    server.on('close', () => {
      emitter.emit(constants.SERVER_CLOSED_EVENT);
    });

    server.on('connection', client => {
      if (dbStatus === 'connected') {
        client.send(JSON.stringify({
          connectionInfo: {
            connected: true,
            connectorIdName: db.connector.idName,
          },
        }));
      } else {
        client.send(JSON.stringify({
          connectionInfo: {
            connected: false,
          },
        }));
      }
      client.on(
        'message',
        message => relay(emitter, server, db, dbStatus, client, message),
      );
    });

    server.on('error', error => emitter.emit('error', error));

    server.on('listening', conn => {
      emitter.emit(constants.SERVER_LISTENING_EVENT, conn);

      db = data.connect(options.connector());

      db.emitter.on('error', error => {
        emitter.emit('error', error);
      });

      db.emitter.on('connected', () => {
        dbStatus = 'connected';
        emitter.emit(constants.SERVER_CONNECTED_EVENT);
        for (const client of server.clients) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              connectionInfo: {
                connected: true,
                connectorIdName: db.connector.idName,
              },
            }));
          }
        }
      });

      db.emitter.on('disconnected', () => {
        dbStatus = 'disconnected';
        emitter.emit(constants.SERVER_DISCONNECTED_EVENT);
        for (const client of server.clients) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              connectionInfo: {
                disconnected: true,
              },
            }));
          }
        }
      });
    });

    emitter.on('end', () => server.close);
  }, 2000);
  return emitter;
};

export default {
  start,
};
