import find from 'lodash/find';

import clients from './clients';

const getConnectorIdName = (clientId) => {
  const client = find(clients, {id: clientId});
  return client.connectorIdName;
};

export default getConnectorIdName;
