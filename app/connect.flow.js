// @flow

declare type MaevaSocketsClientRequest = {
  action: MaevaAction,
  id: MaevaSocketsQueueId,
  model: MaevaModelJSON,
  query: {
    get: Object[],
    set: Object[],
    unset: Object[],
  },
};

declare type MaevaSocketsQueueId = number;

declare type MaevaSocketsQueueItem = {
  id: MaevaSocketsQueueId,
  resolve: (response: MaevaConnectorResponse) => void,
  reject: (error: Error) => void,
};
