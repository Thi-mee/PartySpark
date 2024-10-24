// src/services/webSocketService.ts
import { inject, injectable } from 'inversify';
import {
  TYPES,
  type IWebSocketService,
  type WebSocketConfig,
} from '../types/websocket.types';
import { HeartbeatService } from './heartbeatService';
import { RoomService } from './roomService';
import type { ServerWebSocket } from 'bun';
import type { MessageRouter } from './messageRouter';

@injectable()
export class WebSocketService implements IWebSocketService {
  constructor(
    @inject(TYPES.WebSocketConfig) private config: WebSocketConfig,
    @inject(TYPES.MessageRouter) private router: MessageRouter,
    @inject(TYPES.HeartbeatService) private heartbeatService: HeartbeatService,
    @inject(TYPES.RoomService) private roomService: RoomService
  ) {}

  async handleMessage(
    ws: ServerWebSocket<undefined>,
    message: string | Buffer
  ): Promise<void> {
    if (typeof message === 'string') {
      await this.router.handle(ws, message);
    } else {
      console.log(`Received binary message of length: ${message.length}`);
    }
  }

  handleOpen(ws: ServerWebSocket<undefined>): void {
    console.log('New client connected');
    this.heartbeatService.setupHeartbeat(ws);
    ws.send(
      JSON.stringify({
        type: 'welcome',
        message: 'Welcome to the gaming platform!',
        timestamp: Date.now(),
      })
    );
  }

  handleClose(
    ws: ServerWebSocket<undefined>,
    code: number,
    reason: string
  ): void {
    console.log(`Client disconnected with code: ${code}, reason: ${reason}`);
    this.heartbeatService.clearHeartbeat(ws);
    this.roomService.removeFromAllRooms(ws);
  }

  handlePing(ws: ServerWebSocket<undefined>, data: Buffer): void {
    this.heartbeatService.handlePing(ws, data);
  }

  handlePong(ws: ServerWebSocket<undefined>, _data: Buffer): void {
    console.log(_data);
    this.heartbeatService.handlePong(ws);
  }

  handleDrain(_ws: ServerWebSocket<undefined>): void {
    console.log(_ws);
    console.log('Backpressure detected, taking corrective action');
  }
}
