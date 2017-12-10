let id = 0;

export const addClient = () => {
  const clientId = id++;
  const client = {
    connectorIdName: null,
    id: clientId,
    socket: null,
    socketId: '?',
  };
  clients.push(client);
  return clientId;
};

const clients = [];

export default clients;
