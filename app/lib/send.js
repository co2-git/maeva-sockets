export default function send(ws, message) {
  try {
    ws.send(JSON.stringify({message}));
  } catch (error) {
    console.log(error.stack);
  }
}
