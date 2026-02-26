import { WebSocket } from "ws";
import type { WebSocketMessage } from "../types/game.types.js";

export class WebSocketManager {
  private connections: Map<string, WebSocket> = new Map();

  addConnection(playerId: string, ws: WebSocket): void {
    this.connections.set(playerId, ws);

    ws.on("close", () => {
      this.removeConnection(playerId);
    });
  }

  removeConnection(playerId: string): void {
    this.connections.delete(playerId);
  }

  sendToPlayer(playerId: string, message: WebSocketMessage): void {
    const ws = this.connections.get(playerId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  broadcastToRoom(playerIds: string[], message: WebSocketMessage): void {
    playerIds.forEach((playerId) => {
      this.sendToPlayer(playerId, message);
    });
  }

  // what
  getConnectionCount(): number {
    return this.connections.size;
  }

  // what
  getPlayerIds(): string[] {
    return Array.from(this.connections.keys());
  }
}
