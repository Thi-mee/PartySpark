// src/services/messageRouter.ts
import { inject, injectable } from 'inversify';
import {
  TYPES,
  type BaseMessage,
  type IMessageRouter,
  type MessageHandler,
  type Middleware,
} from '../types/websocket.types';
import { ErrorService } from './errorService';
import type { ServerWebSocket } from 'bun';

@injectable()
export class MessageRouter implements IMessageRouter {
  private routes = new Map<string, MessageHandler>();
  private middlewares: Middleware[] = [];

  constructor(@inject(TYPES.ErrorService) private errorService: ErrorService) {}

  use(middleware: Middleware): void {
    this.middlewares.push(middleware);
  }

  on<T extends BaseMessage>(
    messageType: T['type'],
    handler: MessageHandler<T>
  ): void {
    if (this.routes.has(messageType)) {
      console.warn(
        `Handler for message type '${messageType}' is being overwritten`
      );
    }
    console.log(`Registered handler for message type: ${messageType}`);
    this.routes.set(messageType, handler as MessageHandler);
    console.log(
      `Handlers available: ${Array.from(this.routes.keys()).join(', ')}`
    );
  }

  off(messageType: string): void {
    this.routes.delete(messageType);
  }

  async handle(ws: ServerWebSocket<undefined>, message: string): Promise<void> {
    try {
      const parsedMessage = JSON.parse(message) as BaseMessage;

      if (!this.validateMessage(parsedMessage)) {
        await this.errorService.sendError(ws, 'Invalid message format');
        return;
      }

      for (const middleware of this.middlewares) {
        if (!(await middleware(ws, parsedMessage))) {
          return;
        }
      }

      console.log(
        `Handlers available: ${Array.from(this.routes.keys()).join(', ')}`
      );
      const handler = this.routes.get(parsedMessage.type);
      if (handler) {
        try {
          await handler(ws, parsedMessage);
        } catch (error) {
          console.error(`Error in handler for ${parsedMessage.type}:`, error);
          await this.errorService.sendError(ws, 'Internal handler error');
        }
      } else {
        console.log(`No handler found for message type: ${parsedMessage.type}`);
        await this.errorService.sendError(
          ws,
          `Unhandled message type: ${parsedMessage.type}`
        );
      }
    } catch (error) {
      console.error('Error parsing message:', error);
      await this.errorService.sendError(ws, 'Invalid JSON');
    }
  }

  private validateMessage(
    message: Record<string, unknown>
  ): message is BaseMessage {
    console.log('Validating message:', message);
    return (
      message &&
      typeof message === 'object' &&
      typeof message.type === 'string' &&
      message.type.length > 0
    );
  }
}
