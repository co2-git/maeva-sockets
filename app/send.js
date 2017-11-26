// @flow

export default function send(ws: WebSocket, message: Object) {
  ws.send(JSON.stringify(message));
}
