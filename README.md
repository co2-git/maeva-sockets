maeva-sockets
===

Framework to set up a web sockets server that can transport database queries and deliver them to clients.

`maeva-sockets` relies on [maeva](https://github.com/co2-git/maeva).

# Why

Even when you have a database server set up, you need a relay server (HTTP or Web Sockets) so that your client can connect to the database server. `maeva-sockets` gives a framework so you can easily create a server your client can talk to to transport database queries.
Especially useful for web, Electron desktop or React Native/reactors clients.

# Server

It is easy to set up a server. Let's say you want to set up a server that can transport queries to a MongoDB server:

```javascript
import Server from 'maeva-sockets/dist/server';
import mongodb from 'maeva-mongodb';

const port = 7000;
const drivers = [{name: 'mongodb', connect: mongodb}];

// Start server
const server = new Server(port, drivers);
```

# Client

```javascript
import maeva, {Model} from 'maeva';
import connect from 'maeva-sockets/dist/connect';
// use this line for web
import Client from  'maeva-sockets/dist/client-web';
// use this line for node
import Client from  'maeva-sockets/dist/client-node';

// Define your maeva model
class Foo extends Model {
  static schema = {foo: Number};
}

// Connect to sockets server
const serverURL = 'ws://localhost:7000';
const mongodburl = 'mongodb://localhost:2109';

maeva.connect(connect(Client, serverURL, {
  driver: 'mongodb',
  url: mongodburl,
}));

// Now you can call any queries
Foo.find().then(foos => console.log({found: foos}));
```
