import find from 'lodash/find';

import clients from '../lib/clients';

const disconnect = clientId => new Promise((resolve, reject) => {
  try {
    const client = find(clients, {id: clientId});
    client.socket.disconnect();
  } catch (error) {
    reject(error);
  }
});

export default disconnect;
