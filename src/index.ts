import 'reflect-metadata';
import { container } from './container';
import { TYPES, type IWebSocketService } from './types/websocket.types';
import { GameHandlers } from './handlers/gameHandlers';

// Initialize handlers
container.resolve(GameHandlers);

const wsService = container.get<IWebSocketService>(TYPES.WebSocketService);

const server = Bun.serve({
  port: 3000,
  fetch(req, server) {
    if (server.upgrade(req)) {
      return;
    }
    return new Response('Upgrade failed', { status: 400 });
  },
  websocket: {
    message: wsService.handleMessage.bind(wsService),
    open: wsService.handleOpen.bind(wsService),
    close: wsService.handleClose.bind(wsService),
    ping: wsService.handlePing.bind(wsService),
    pong: wsService.handlePong.bind(wsService),
    drain: wsService.handleDrain.bind(wsService),
  },
});

console.log(`WebSocket server running at ws://localhost:${server.port}`);

// Handle SIGINT (Ctrl+C) gracefully
process.on('SIGINT', () => {
  server.stop();
});
