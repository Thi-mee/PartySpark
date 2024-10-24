// src/container.ts
import { Container } from 'inversify';
import { TYPES, type WebSocketConfig } from './types/websocket.types';
import { MessageRouter } from './services/messageRouter';
import { WebSocketService } from './services/webSocketService';
import { HeartbeatService } from './services/heartbeatService';
import { ErrorService } from './services/errorService';
import { RoomService } from './services/roomService';

export const container = new Container({ defaultScope: 'Singleton' });

// Configure default WebSocket settings
const config: WebSocketConfig = {
  maxPayloadLength: 1_000_000,
  backpressureLimit: 1_000_000,
  closeOnBackpressureLimit: true,
  publishToSelf: true,
  sendPings: true,
  perMessageDeflate: {
    compress: true,
    decompress: true,
  },
  heartbeatInterval: 30000,
};

container.bind<WebSocketConfig>(TYPES.WebSocketConfig).toConstantValue(config);
container.bind<MessageRouter>(TYPES.MessageRouter).to(MessageRouter);
container.bind<WebSocketService>(TYPES.WebSocketService).to(WebSocketService);
container.bind<HeartbeatService>(TYPES.HeartbeatService).to(HeartbeatService);
container.bind<ErrorService>(TYPES.ErrorService).to(ErrorService);
container.bind<RoomService>(TYPES.RoomService).to(RoomService);
