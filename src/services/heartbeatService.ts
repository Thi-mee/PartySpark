// src/services/heartbeatService.ts
import { inject, injectable } from 'inversify';
import { TYPES, type WebSocketConfig } from '../types/websocket.types';
import type { ServerWebSocket } from 'bun';

@injectable()
export class HeartbeatService {
  private heartbeatTimeouts = new Map<
    ServerWebSocket<undefined>,
    NodeJS.Timer
  >();

  constructor(@inject(TYPES.WebSocketConfig) private config: WebSocketConfig) {}

  setupHeartbeat(ws: ServerWebSocket<undefined>): void {
    const timeout = setTimeout(
      () => {
        console.log('Client heartbeat timeout, closing connection');
        ws.close(1000, 'Heartbeat timeout');
      },
      (this.config.heartbeatInterval || 30000) * 2
    );

    this.heartbeatTimeouts.set(ws, timeout);
  }

  clearHeartbeat(ws: ServerWebSocket<undefined>): void {
    const timeout = this.heartbeatTimeouts.get(ws);
    if (timeout) {
      clearTimeout(timeout);
      this.heartbeatTimeouts.delete(ws);
    }
  }

  handlePing(ws: ServerWebSocket<undefined>, data: Buffer): void {
    this.clearHeartbeat(ws);
    this.setupHeartbeat(ws);
    ws.pong(data as unknown as string);
  }

  handlePong(ws: ServerWebSocket<undefined>): void {
    this.clearHeartbeat(ws);
    this.setupHeartbeat(ws);
  }
}
