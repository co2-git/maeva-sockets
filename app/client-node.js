import WebSocket from 'ws';
import Client from './client';

export default class MaevaSockets_NodeClient extends Client {
  constructor(url) {
    super(new WebSocket(url));
  }
}
