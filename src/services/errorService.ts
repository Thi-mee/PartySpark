// src/services/errorService.ts
import { injectable } from 'inversify';
import type { ServerWebSocket } from 'bun';

@injectable()
export class ErrorService {
  async sendError(
    ws: ServerWebSocket<undefined>,
    error: string
  ): Promise<void> {
    try {
      ws.send(
        JSON.stringify({
          type: 'error',
          error,
          timestamp: Date.now(),
        })
      );
    } catch (e) {
      console.error('Error sending error message:', e);
    }
  }
}
