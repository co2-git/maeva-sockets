import insert from './insert';
import find from './find';

export default
function maevaConnectSocketsWeb(Client, socketsUrl, {driver, url}) {
  return (conn) => new Promise(async (resolve, reject) => {
    try {
      const client = new Client(socketsUrl);

      await new Promise((resolveOpen) => {
        client.on('open', resolveOpen);
      });

      client.auth({driver, url});

      await new Promise((resolveDB) => {
        client.on('connected', resolveDB);
      });

      conn.operations = {
        insert: (inserter) => insert(client, inserter),
        // count: (finder, options) => count(conn, finder, options),
        find: (finder, options) => new Promise(
          async (resolveFind, rejectFind) => {
            try {
              const {results} = await find(client, finder, options);
              resolveFind({results, conn: client.conn});
            } catch (error) {
              rejectFind(error);
            }
          }
        ),
        // findOne: (finder, options) => findOne(conn, finder, options),
        // findById: (finder, options) => findById(conn, finder, options),
        // update: (updater) => update(conn, updater),
        // updateOne: (updater) => updateOne(conn, updater),
        // updateById: (updater) => updateById(conn, updater),
        // remove: (remover) => remove(conn, remover),
        // removeById: (remover) => removeById(conn, remover),
      };

      conn.disconnectDriver = ::client.close;

      resolve();
    } catch (error) {
      reject(error);
    }
  });
}
