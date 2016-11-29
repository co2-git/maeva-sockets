/* globals WebSocket */

import Client from './client';

export default class WebClient extends Client {
  constructor(url) {
    const client = new WebSocket(url);
    client.on = (event, cb) => {
      console.log({event});
      switch (event) {
      case 'message':
        client.onmessage = (messageEvent) => {
          return cb(messageEvent.data);
        };
        break;
      case 'open':
        client.onopen = cb;
        break;
      case 'error':
        client.onerror = cb;
        break;
      }
    };
    super(client);
  }
}
