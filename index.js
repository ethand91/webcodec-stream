const WebSocket = require('ws');
const express = require('express');

const app = express();
const port = 3000;
const connectedClients = new Set();

app.use(express.static(__dirname + '/public'));

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', ws => {
  console.log('new connection');
  connectedClients.add(ws);

  ws.on('message', message => {
    connectedClients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.once('close', () => {
    connectedClients.delete(ws);
    console.log('connection closed');
  });
});

const server = app.listen(port, () => {
  console.log(`server running on port ${port}`);
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});
