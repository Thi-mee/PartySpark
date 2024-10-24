import type { ServerWebSocket } from 'bun';
import { injectable } from 'inversify';

@injectable()
export class RoomService {
  private _rooms: Record<string, Set<ServerWebSocket<undefined>>> = {};

  get rooms() {
    return this._rooms;
  }

  // Join a client to a room
  joinRoom(ws: ServerWebSocket<undefined>, room: string) {
    if (!this._rooms[room]) {
      this._rooms[room] = new Set();
    }
    this._rooms[room].add(ws);
    ws.send(JSON.stringify({ message: `Joined room: ${room}` }));
    console.log(`Client joined room: ${room}`);
  }

  // Leave a client from a room
  leaveRoom(ws: ServerWebSocket<undefined>, room: string) {
    if (this._rooms[room]) {
      this._rooms[room].delete(ws);
      ws.send(JSON.stringify({ message: `Left room: ${room}` }));
      console.log(`Client left room: ${room}`);
    }
  }

  removeFromAllRooms(ws: ServerWebSocket<undefined>) {
    for (const room in this._rooms) {
      if (this._rooms[room].has(ws)) {
        this.leaveRoom(ws, room);
      }
    }
  }

  // Broadcast a message to all clients in a room
  broadcastToRoom(room: string, data: unknown) {
    if (this._rooms[room]) {
      const message = JSON.stringify(data);
      this._rooms[room].forEach((clientWs) => {
        clientWs.send(message);
      });
      console.log(`Broadcasted message to room: ${room}`);
    }
  }
}
