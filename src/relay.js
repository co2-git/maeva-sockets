import * as constants from './constants';

const relay = (emitter, server, db, dbStatus, client, message) => {
  new Promise(async (resolve, reject) => {
    let queueId;
    try {
      emitter.emit(constants.SERVER_INCOMING_MESSAGE_EVENT, {message, client});
      const parsed = JSON.parse(message);
      const {action, query, model} = parsed.message;
      queueId = parsed.message.id;
      const {actions} = db.connector;
      const {
        id,
        ids,
        document,
        documents,
        queries,
        updaters,
        options
      } = query;
      let connectorResponse;
      switch (action) {
      case 'count':
        connectorResponse = await actions.count(
          queries,
          model,
          options,
        );
        break;
      case 'findById':
        connectorResponse = await actions.findById(
          id,
          model,
          options,
        );
        break;
      case 'findByIds':
        connectorResponse = await actions.findByIds(
          ids,
          model,
          options,
        );
        break;
      case 'findOne':
        connectorResponse = await actions.findOne(
          queries,
          model,
          options,
        );
        break;
      case 'findMany':
        connectorResponse = await actions.findMany(
          queries,
          model,
          options,
        );
        break;
      case 'insertOne':
        connectorResponse = await actions.insertOne(
          document,
          model,
          options,
        );
        break;
      case 'insertMany':
        connectorResponse = await actions.insertMany(
          documents,
          model,
          options,
        );
        break;
      case 'removeById':
        connectorResponse = await actions.removeById(
          id,
          model,
          options,
        );
        break;
      case 'removeByIds':
        connectorResponse = await actions.removeByIds(
          ids,
          model,
          options,
        );
        break;
      case 'removeMany':
        connectorResponse = await actions.removeMany(
          queries,
          model,
          options,
        );
        break;
      case 'removeOne':
        connectorResponse = await actions.removeOne(
          queries,
          model,
          options,
        );
        break;
      case 'updateById':
        connectorResponse = await actions.updateById(
          id,
          updaters,
          model,
          options,
        );
        break;
      case 'updateByIds':
        connectorResponse = await actions.updateByIds(
          ids,
          updaters,
          model,
          options,
        );
        break;
      case 'updateOne':
        connectorResponse = await actions.updateOne(
          queries,
          updaters,
          model,
          options,
        );
        break;
      case 'updateMany':
        connectorResponse = await actions.updateMany(
          queries,
          updaters,
          model,
          options,
        );
        break;
      }
      const response = connectorResponse;
      emitter.emit(constants.SERVER_GOT_RESPONSE_FROM_DB_EVENT, response);
      const out = {message: {response, id: queueId}};
      emitter.emit(constants.SERVER_OUTCOMING_MESSAGE_EVENT, out);
      client.send(JSON.stringify(out));
    } catch (error) {
      client.send(JSON.stringify({
        message: {
          error: {message: error.message, stack: error.stack},
          id: queueId,
        }}));
      reject(error);
    }
  }).catch(error => {
    emitter.emit('error', error);
  });
};

export default relay;
