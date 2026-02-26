import type { Player, Room } from "../types/game.types.js";

export class GameService {
  startGame(room: Room): Room {
    if (room.players.length < 2) {
      // TODO: this throw should be correctly emmited to client without app crash
      throw new Error("Need at least 2 players to start the game");
    }

    room.status = "playing";
    room.currentRound = 1;
    this.selectRandomDrawer(room);

    return room;
  }

  selectRandomDrawer(room: Room): void {
    const currentIndex = room.players.findIndex(
      (p) => p.id === room.currentDrawer,
    );
    const nextIndex = (currentIndex + 1) % room.players.length;

    room.players.forEach((p) => {
      p.isDrawer = false;
    });
    room.players[nextIndex].isDrawer = true;
    room.currentDrawer = room.players[nextIndex].id;
  }

  // selectGuesserAsNextDrawer(room: Room): void {
  // TODO: next drawer should be person who guessed the word, if drawer has been disconnected then selectRandomDrawer fired.
  // }

  nextRound(room: Room): Room {
    room.currentRound++;
    if (room.currentRound > room.rounds) {
      room.status = "finished";
    } else {
      this.selectRandomDrawer(room);
      // this.selectGuesserAsNextDrawer(room);
    }

    return room;
  }

  addScore(playerId: string, points: number, room: Room): Room {
    const player = room.players.find((p) => p.id === playerId);
    if (player) {
      player.score += points;
    } else {
      // TODO: this should be emmited to client without app crash
      throw new Error("Player not found");
    }

    return room;
  }

  // what
  getWinner(room: Room): Player | null {
    if (room.status !== "finished") {
      return null;
    }

    return room.players.reduce((winner, player) =>
      player.score > winner.score ? player : winner,
    );
  }
}
