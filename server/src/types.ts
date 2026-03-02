// Game configuration from defaultGames.json
export interface GameConfig {
  id: string;
  name: string;
  description: string;
  tags: string[];
  imageUrl: string;
  boardProps: {
    width: number;
    height: number;
    emptyValue: number;
  };
}

// Player in a game session
export interface Player {
  id: string;
  name: string;
  socketId: string;
  piece: string | number;
}

// Game session
export interface GameSession {
  id: string;
  gameConfig: GameConfig;
  players: Player[];
  board: (string | number)[];
  currentPlayerIndex: number;
  status: 'waiting' | 'playing' | 'finished';
  winner: Player | null;
  isTie: boolean;
  createdAt: Date;
  moves: Array<{ playerIndex: number; x: number; y: number; timestamp: Date }>;
}

// Lobby info
export interface LobbyInfo {
  totalPlayers: number;
  activeSessions: number;
  availableGames: GameConfig[];
}

// Move result
export interface MovePayload {
  x: number;
  y: number;
}

export interface MoveResult {
  success: boolean;
  board: (string | number)[];
  currentPlayerIndex: number;
  winner: Player | null;
  isTie: boolean;
  message?: string;
}

// WebSocket event types
export type ClientToServerEvents = {
  'player:join': (playerName: string, callback: (sessionId: string, players: Player[]) => void) => void;
  'player:list-sessions': (callback: (sessions: Omit<GameSession, 'board' | 'moves'>[]) => void) => void;
  'session:join': (sessionId: string, callback: (session: GameSession, players: Player[]) => void) => void;
  'session:create': (
    gameId: string,
    callback: (sessionId: string, session: GameSession) => void
  ) => void;
  'session:list-available': (callback: (sessions: Omit<GameSession, 'board'>[]) => void) => void;
  'game:ready': () => void;
  'game:move': (move: MovePayload, callback: (result: MoveResult) => void) => void;
  'game:resign': () => void;
};

export type ServerToClientEvents = {
  'connection:established': (playerId: string) => void;
  'session:created': (session: GameSession) => void;
  'session:joined': (players: Player[]) => void;
  'session:player-joined': (player: Player) => void;
  'session:player-left': (playerId: string) => void;
  'game:start': (currentPlayerIndex: number) => void;
  'game:move-made': (result: MoveResult) => void;
  'game:finished': (winner: Player | null, isTie: boolean) => void;
  'game:state-sync': (session: GameSession) => void;
  'error': (message: string) => void;
};
