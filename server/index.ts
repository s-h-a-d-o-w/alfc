import express from 'express';
import path from 'path';
import ws from 'ws';

const app = express();

const port = 3001;

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
} else {
  app.get('/', (req, res) => {
    res.send('Hello Worlffd!');
  });
}

const server = app.listen(port, () => {
  console.log('Server running');
});

const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', (socket) => {
  socket.on('message', (message) => {
    console.log(message);
  });
});

server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (socket) => {
    wsServer.emit('connection', socket, request);
  });
});
