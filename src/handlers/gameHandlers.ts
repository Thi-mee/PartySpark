import { TYPES, type BaseMessage } from '../types/websocket.types';
import { inject, injectable } from 'inversify';
import { RoomService } from '../services/roomService';
import type { MessageRouter } from '../services/messageRouter';

@injectable()
export class GameHandlers {
  constructor(
    @inject(TYPES.MessageRouter) private router: MessageRouter,
    @inject(TYPES.RoomService) private roomService: RoomService
  ) {
    this.registerHandlers();
  }

  private registerHandlers(): void {
    console.log('Registering game handlers');

    this.router.on<BaseMessage & { type: 'join'; roomId: string }>(
      'join',
      async (ws, data) => {
        this.roomService.joinRoom(ws, data.roomId);
        ws.send(JSON.stringify({ type: 'joined', roomId: data.roomId }));
      }
    );

    this.router.on<BaseMessage & { type: 'leave'; roomId: string }>(
      'leave',
      async (ws, data) => {
        this.roomService.leaveRoom(ws, data.roomId);
      }
    );
  }
}
