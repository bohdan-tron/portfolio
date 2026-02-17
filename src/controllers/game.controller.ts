import type { IncomingMessage, ServerResponse } from "node:http";
import { RoomService } from "../services/room.service.js";

export class GameController {
  private roomService: RoomService;

  constructor() {
    this.roomService = new RoomService();
  }

  public getRoomByCode = (req: IncomingMessage, res: ServerResponse): void => {
    // const { roomCode } = req.params;
    const url = req.url || "";
    const pathParts = url.split("/").filter((part) => part);
    const roomCode = pathParts.at(-1);

    if (!roomCode) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Room code is required" }));
      return;
    }

    const room = this.roomService.getRoomByCode(roomCode);
    if (!room) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Room not found" }));
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        roomCode: room.code,
        playerCount: room.players.length,
        maxPlayers: room.maxPlayers,
        status: room.status,
        players: room.players.map((p) => ({
          id: p.id,
          name: p.name,
          isDrawer: p.isDrawer,
          isHost: p.isHost,
          score: p.score,
        })),
      }),
    );
  };

  public getAllRooms = (_req: IncomingMessage, res: ServerResponse): void => {
    const rooms = this.roomService.getAllRooms();

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        rooms: rooms.map((room) => ({
          roomCode: room.code,
          playerCount: room.players.length,
          maxPlayers: room.maxPlayers,
          status: room.status,
        })),
      }),
    );
  };

  public validateRoomCode = (
    req: IncomingMessage,
    res: ServerResponse,
  ): void => {
    // const { roomCode } = req.body;
    const url = req.url || "";
    const pathParts = url.split("/").filter((part) => part);
    const roomCode = pathParts.at(-1);

    if (!roomCode) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ valid: false, error: "Room code is required" }));
      return;
    }

    const room = this.roomService.getRoomByCode(roomCode);
    const valid = room !== undefined;

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        valid,
        room: valid
          ? {
              roomCode: room.code,
              playerCount: room.players.length,
              maxPlayers: room.maxPlayers,
              status: room.status,
            }
          : null,
      }),
    );
  };
}
