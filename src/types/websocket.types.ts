import type { ServerWebSocket, WebSocketCompressor } from 'bun';

export interface BaseMessage {
  type: string;
  [key: string]: unknown;
}

export interface WebSocketConfig {
  maxPayloadLength?: number;
  backpressureLimit?: number;
  closeOnBackpressureLimit?: boolean;
  idleTimeout?: number;
  publishToSelf?: boolean;
  sendPings?: boolean;
  perMessageDeflate?: {
    compress?: WebSocketCompressor | boolean;
    decompress?: WebSocketCompressor | boolean;
  };
  heartbeatInterval?: number;
}

export type MessageHandler<T extends BaseMessage = BaseMessage> = (
  ws: ServerWebSocket<undefined>,
  data: T
) => void | Promise<void>;

export type Middleware = (
  ws: ServerWebSocket<undefined>,
  message: BaseMessage
) => boolean | Promise<boolean>;

export interface IMessageRouter {
  on<T extends BaseMessage>(
    messageType: T['type'],
    handler: MessageHandler<T>
  ): void;
  off(messageType: string): void;
  handle(ws: ServerWebSocket<undefined>, message: string): Promise<void>;
  use(middleware: Middleware): void;
}

export interface IWebSocketService {
  handleMessage(
    ws: ServerWebSocket<undefined>,
    message: string | Buffer
  ): Promise<void>;
  handleOpen(ws: ServerWebSocket<undefined>): void;
  handleClose(
    ws: ServerWebSocket<undefined>,
    code: number,
    reason: string
  ): void;
  handlePing(ws: ServerWebSocket<undefined>, data: Buffer): void;
  handlePong(ws: ServerWebSocket<undefined>, data: Buffer): void;
  handleDrain(ws: ServerWebSocket<undefined>): void;
}

// declare module 'bun' {
//   interface Env {
//     AWESOME: string;
//   }
// }

export const TYPES = {
  MessageRouter: Symbol.for('MessageRouter'),
  WebSocketService: Symbol.for('WebSocketService'),
  HeartbeatService: Symbol.for('HeartbeatService'),
  ErrorService: Symbol.for('ErrorService'),
  RoomService: Symbol.for('RoomService'),
  WebSocketConfig: Symbol.for('WebSocketConfig'),
};

export interface HandlerMessage<T = Record<string, unknown>>
  extends BaseMessage {
  type: string;
  data: T;
}
