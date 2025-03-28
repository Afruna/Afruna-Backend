/* eslint-disable import/first */
require('@config').optionsValidation();

import App from '@app';
import { logger } from '@utils/logger';
import { DB_URI, PORT, OPTIONS } from '@config';
import { SocketEvents } from '@events/socket';

(global as any).logger = logger;

const app = new App();
if (OPTIONS.USE_SOCKETS) {
  
  // app.io!.on('connection', (socket) => {
  //   logger.info(['socket connected', socket.id]);
  //   console.log("Socket on")
  //   app.io!.on('connection', new SocketEvents(app.io!).joinConversations);
  // });

  app.io!.on('connection', new SocketEvents(app.io!).joinConversations);
}

app.listen(<number>(<unknown>PORT), DB_URI);
