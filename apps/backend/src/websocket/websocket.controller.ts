import { WebSocket, type WebSocketServer } from "ws";
import { RoomService } from "../services/room.service.js";
import {
  type CreateRoomPayload,
  GameStartPayload,
  type JoinRoomPayload,
  type PlayerJoinedPayload,
  type RoomCreatedPayload,
  type WebSocketMessage,
} from "../types/game.types.js";
import { WebSocketManager } from "./websocket-manager.js";

export class WebSocketController {
  private wss: WebSocketServer;
  private roomService: RoomService;
  private wsManager: WebSocketManager;

  constructor(wss: WebSocketServer) {
    this.wss = wss;
    this.roomService = new RoomService();
    this.wsManager = new WebSocketManager();
    this.setupWebSocketServer();
  }

  private setupWebSocketServer(): void {
    this.wss.on("connection", (ws: WebSocket, req) => {
      console.log("New WebSocket connection established");

      ws.on("message", (data: Buffer) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error("Invalid message format:", error);
          this.sendError(ws, "Invalid message format");
        }
      });

      ws.on("close", () => {
        console.log("WebSocket connection closed");
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
      });
    });
  }

  private handleMessage(ws: WebSocket, message: WebSocketMessage): void {
    switch (message.type) {
      case "create-room":
        this.handleCreateRoom(ws, message.payload as CreateRoomPayload);
        break;
      case "join-room":
        this.handleJoinRoom(ws, message.payload as JoinRoomPayload);
        break;
      case "start-game":
        this.handleStartGame(ws, message.payload);
        break;
      default:
        this.sendError(ws, "Unknown message type");
    }
  }

  private handleCreateRoom(ws: WebSocket, payload: CreateRoomPayload): void {
    try {
      const { room, player } = this.roomService.createRoom(
        payload.playerName,
        payload.maxPlayers,
      );

      this.wsManager.addConnection(player.id, ws);

      const response: RoomCreatedPayload = { room, player };
      this.sendToPlayer(player.id, "room-created", response);

      console.log(`Room created with code: ${room.code}`);
    } catch (error) {
      this.sendError(ws, "Failed to create room");
    }
  }

  private handleJoinRoom(ws: WebSocket, payload: JoinRoomPayload): void {
    try {
      const room = this.roomService.getRoomByCode(payload.roomCode);
      if (!room) {
        this.sendError(ws, "Room not found");
        return;
      }

      if (room.players.length >= room.maxPlayers) {
        this.sendError(ws, "Room is full");
        return;
      }

      const result = this.roomService.addPlayerToRoom(
        room.id,
        payload.playerName,
      );
      if (!result) {
        this.sendError(ws, "Failed to join room");
        return;
      }

      const { player } = result;
      this.wsManager.addConnection(player.id, ws);

      const joinResponse: PlayerJoinedPayload = { room: result.room, player };
      this.sendToPlayer(player.id, "player-joined", joinResponse);

      const playerIds = result.room.players.map((p) => p.id);
      this.broadcastToRoom(playerIds, "player-list-updated", {
        players: result.room.players,
      });

      console.log(`Player ${player.name} joined room ${room.code}`);
    } catch (error) {
      this.sendError(ws, "Failed to join room");
    }
  }

  private handleStartGame(ws: WebSocket, payload: any): void {
    // TODO: Implementation will be added in next phase
    this.sendError(ws, "Game start functionality not yet implemented");
  }

  private sendToPlayer(playerId: string, type: string, payload: any): void {
    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: new Date(),
    };
    this.wsManager.sendToPlayer(playerId, message);
  }

  private broadcastToRoom(
    playerIds: string[],
    type: string,
    payload: any,
  ): void {
    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: new Date(),
    };
    this.wsManager.broadcastToRoom(playerIds, message);
  }

  private sendError(ws: WebSocket, error: string): void {
    const message: WebSocketMessage = {
      type: "error",
      payload: { error },
      timestamp: new Date(),
    };

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
}
