import type { Player } from "../types/game.types.js";
import { generateUuid } from "../utils/room-generator.js";

export class PlayerService {
  private players: Map<string, Player> = new Map();

  createPlayer(
    name: string,
    isDrawer: boolean = false,
    isHost: boolean = false,
  ): Player {
    const player: Player = {
      id: generateUuid(),
      name,
      isDrawer,
      isHost,
      score: 0,
      joinedAt: new Date(),
    };

    this.updatePlayer(player);
    return player;
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  updatePlayer(player: Player): void {
    this.players.set(player.id, player);
  }

  removePlayer(playerId: string): void {
    this.players.delete(playerId);
  }

  getAllPlayers(): Player[] {
    return Array.from(this.players.values());
  }
}
