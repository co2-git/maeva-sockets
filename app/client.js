import uuid from 'uuid';
import EventEmitter from 'events';

export default class Client {
  client;
  conn;
  emitter = new EventEmitter();
  constructor(client) {
    this.client = client;
    this.client.on('message', this.onMessage.bind(this));
    this.client.on('open', () => this.emitter.emit('open'));
    this.client.on('error', (error) => this.emitter.emit('error', error));
  }
  close() {
    this.client.close();
  }
  onMessage(messageString) {
    const message = JSON.parse(messageString);
    console.log({message});
    if (message.connected) {
      this.emitter.emit('connected');
    } else if (message.id) {
      this.emitter.emit(message.id, message);
    } else if (message.message) {
      this.emitter.emit('message', message.message);
    }
  }
  send(message) {
    console.log(require('util').inspect({client: {send: message}}, { depth: null }));
    this.client.send(JSON.stringify(message));
  }
  on(event, cb) {
    this.emitter.on(event, cb);
    return this;
  }
  once(event, cb) {
    this.emitter.once(event, cb);
    return this;
  }
  off(event, cb) {
    this.emitter.removeListener(event, cb);
    return this;
  }
  auth(auth) {
    console.log({client: {auth}});
    this.send({
      action: 'auth',
      auth,
    });
    return this;
  }
  listenTo(collection) {
    this.send({
      action: 'listen',
      collection,
    });
  }
  query(action, collection, {get, set}) {
    const id = uuid.v4();
    this.send({
      id,
      action,
      collection,
      get,
      set,
    });
    return id;
  }
  find(collection, get) {
    return this.query('find', collection, {get});
  }
  update(collection, get, set) {
    this.query('update', collection, {get, set});
  }
  insert(collection, set) {
    return this.query('insert', collection, {set});
  }
  remove(collection, get) {
    this.query('remove', collection, {get});
  }
  count(collection, get) {
    this.query('count', collection, {get});
  }
}
