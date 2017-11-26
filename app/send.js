// @flow

export default function send(ws: WebSocket, message: Object, server) {
  ws.send(JSON.stringify({
    message,
    connector: {id: server.connection.connector.id}
  }));
}
