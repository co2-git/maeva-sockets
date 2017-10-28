maeva-sockets
===

Framework to set up a web sockets server that can transport database queries and deliver them to clients.

`maeva-sockets` relies on [maeva](https://github.com/co2-git/maeva).

# Why

Even when you have a database server set up, you need a relay server (HTTP or Web Sockets) so that your client can connect to the database server. `maeva-sockets` gives a framework so you can easily create a server your client can talk to to transport database queries.

# Server

It is easy to set up a server. Let's say you want to set up a server that can transport queries to a MongoDB server:

```javascript
import {Server} from 'maeva-sockets';
import mongodb from 'maeva-mongodb';

const port = 7000;
const mongodbUrl = 'mongodb://@localhost:27019';
const drivers = [
  {
    name: 'mongodb',
    connect: () => mongodb(mongodbUrl),
  }
];

// Start server
export default new Server(port, drivers)
  .on('error', (error) => {})
  .on('listening', (conn) => {
    console.log(`listening on port ${conn.port}`);
  });
```

# Client

```javascript
import maeva, {Model, type} from 'maeva';
import sockets from 'maeva-sockets';

// Define your maeva model
class User extends Model {
  static schema = {email: type(String)};
}

// Connect to sockets server
const serverURL = 'ws://localhost:7000';

maeva.connect(sockets(serverURL));

// Now you can call any queries
User.find().then(users => console.log(users.toJSON()));
```
