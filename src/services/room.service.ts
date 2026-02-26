import type { Player, Room } from "../types/game.types.js";
import { generateRoomCode, generateUuid } from "../utils/room-generator.js";

export class RoomService {
  private rooms: Map<string, Room> = new Map();

  createRoom(
    playerName: string,
    maxPlayers: number = 6,
  ): { room: Room; player: Player } {
    const roomId = generateUuid();
    const roomCode = generateRoomCode();

    const player: Player = {
      id: generateUuid(),
      name: playerName,
      isDrawer: true,
      isHost: true,
      score: 0,
      joinedAt: new Date(),
    };

    const room: Room = {
      id: roomId,
      code: roomCode,
      players: [player],
      maxPlayers,
      status: "waiting",
      currentDrawer: player.id,
      currentWord: null,
      rounds: 100,
      currentRound: 0,
      createdAt: new Date(),
    };

    this.rooms.set(roomId, room);
    return { room, player };
  }

  getRoomById(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getRoomByCode(roomCode: string): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.code === roomCode) {
        return room;
      }
    }
    return undefined;
  }

  addPlayerToRoom(
    roomId: string,
    playerName: string,
  ): { room: Room; player: Player } | null {
    const room = this.getRoomById(roomId);
    if (!room || room.players.length >= room.maxPlayers) {
      // TODO: return appropriate error response (room is currently full)
      return null;
    }

    const player: Player = {
      id: generateUuid(),
      name: playerName,
      isDrawer: false,
      isHost: false,
      score: 0,
      joinedAt: new Date(),
    };

    room.players.push(player);
    this.rooms.set(roomId, room);

    return { room, player };
  }

  removePlayerFromRoom(roomId: string, playerId: string): Room | null {
    const room = this.getRoomById(roomId);
    if (!room) {
      return null;
    }

    room.players = room.players.filter((p: Player) => p.id !== playerId);

    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      return null;
    }

    if (room.currentDrawer === playerId) {
      room.currentDrawer = room.players[0].id;
      room.players[0].isDrawer = true;
    }

    this.rooms.set(roomId, room);
    return room;
  }

  // what
  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  // what
  updateRoom(room: Room): void {
    this.rooms.set(room.id, room);
  }
}
