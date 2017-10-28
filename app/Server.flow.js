// @flow

declare type MaevaSocketsServerOptions = {
  connector: Function,
  name: string,
  port: number
};

declare type MaevaSocketsSocket = {
  socket: WebSocket,
  meta: {
    id: number | string,
  },
};

declare type MaevaSocketsServerResponse = {
  id: number | string,
  connectorResponse: MaevaConnectorResponse,
};
