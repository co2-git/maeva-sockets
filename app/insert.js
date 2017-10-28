// @flow
export default function insert(client: WebSocket, inserter) {
  return new Promise((resolve, reject) => {
    const id = client.insert(inserter.collection, inserter.set);
    client.once(id, ({error, results}) => {
      if (error) {
        reject(new Error(error));
      } else {
        resolve(results);
      }
    });
  });
}
