maeva-sockets
===

Client/server web sockets API to connect any database via [maeva](https://github.com/co2-git/maeva)

# Why

Even when you have a database server set up, you need a relay server (HTTP or Web Sockets) so that your client can connect to the database server. `maeva-sockets` gives a framework so you can easily create a server your client can talk to to transport database queries.

# Server

It is easy to set up a server. Let's say you want to set up a server that can transport queries to a MongoDB server:

```javascript
import sockets from '@maeva/sockets/server';
import mongodb from '@maeva/mongodb';

const WS_URL = 'ws://localhost:9999'; // Web sockets server URL
const DB_URL = 'mongodb://localhost:7777'; // Database URL

sockets
  .start(WS_URL, {connector: () => mongodb(DB_URL, {keepAlive: 5000})})
  .on('error', error => console.log(error));
```

# Client

```javascript
import * as data from 'maeva';
import sockets from '@maeva/sockets/client';

// Define your data model
const userModel = data.model('users', {name: String});

// Connect to sockets server
maeva.connect(sockets('ws://localhost:9999', {keepAlive: 3000}));

// Now you can call any queries
const users = await data.findMany(userModel);
```

# Server events

- `closed` Web sockets server down
- `connected` Web sockets server successfully connected to database
- `disconnected` Web sockets server lost connection to database
- `error` Web sockets server had an error
- `incoming` New web socket client
- `listening` Web sockets server started
- `outcoming` Web socket sent a message to client
- `response` Web socket server got response from DB

# Client

When the sockets server is up, but the connection to database is down, server emits an error that has code `DISCONNECTED_FROM_DB` that you can catch like this:

```js
const client = data.connect(sockets('ws://localhost:8080'));
```
