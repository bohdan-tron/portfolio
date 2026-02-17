export interface Player {
  id: string;
  name: string;
  isDrawer: boolean;
  isHost: boolean;
  score: number;
  joinedAt: Date;
}

export interface Room {
  id: string;
  code: string;
  players: Player[];
  maxPlayers: number;
  status: "waiting" | "playing" | "finished";
  currentDrawer: string | null;
  currentWord: string | null;
  rounds: number;
  currentRound: number;
  createdAt: Date;
}

export interface GameState {
  rooms: Map<string, Room>;
  players: Map<string, { playerId: string; roomId: string }>;
}

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: Date;
}

export interface CreateRoomPayload {
  playerName: string;
  maxPlayers?: number;
}

export interface JoinRoomPayload {
  roomCode: string;
  playerName: string;
}

export interface PlayerJoinedPayload {
  player: Player;
  room: Room;
}

export interface RoomCreatedPayload {
  room: Room;
  player: Player;
}

export interface GameStartPayload {
  room: Room;
}
