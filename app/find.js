export default function find(client, finder) {
  return new Promise((resolve, reject) => {
    const id = client.find(finder.collection, finder.get);
    client.once(id, ({error, results}) => {
      if (error) {
        reject(new Error(error));
      } else {
        resolve({results});
      }
    });
  });
}
