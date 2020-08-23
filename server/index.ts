import express from 'express';
import isElevated from 'is-elevated';
import path from 'path';
import { initNativeServices } from './native';
import { wsServer } from './websocket';
import { isDev } from './utils/consts';

(async () => {
  if (!(await isElevated())) {
    console.log('======================= NOTE ==========================');
    console.log('This needs to be run with elevated privileges.');
    console.log('=======================================================');
    process.exit(1);
  }

  await initNativeServices();

  const app = express();
  const port = 5522;

  if (!isDev) {
    app.use(express.static(path.join(__dirname, './frontend')));
  } else {
    app.get('/', (req, res) => {
      res.send('Nothing to see here.');
    });
  }

  const server = app.listen(port, 'localhost', () => {
    console.log(`Server running @ ${port}`);
  });

  server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, (socket) => {
      wsServer.emit('connection', socket, request);
    });
  });
})();
