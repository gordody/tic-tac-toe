# Multi-Player Game Server Documentation

## Overview

This is a backend server that enables real-time multiplayer board games with support for various game types (Tic-Tac-Toe, Connect 4, Gomoku, etc.). Players can join a lobby, create or join game sessions, and play games with other players across different locations.

## Architecture

### Server Components

```
server/
├── src/
│   ├── index.ts                 # Main Express/Socket.IO server
│   ├── types.ts                 # Shared TypeScript interfaces
│   ├── models/
│   │   └── GameSessionManager.ts # In-memory game session storage
│   ├── services/
│   │   └── GameEngine.ts         # Game logic (moves, win detection)
│   └── handlers/
│       └── gameHandlers.ts       # WebSocket event handlers
└── package.json
```

### Frontend Client

```
src/
└── client/
    ├── GameClient.ts    # SDK for connecting to server
    └── types.ts         # Type exports
```

## Features

- **Real-time Multiplayer**: WebSocket-based communication for instant gameplay
- **Multiple Game Types**: Support for Tic-Tac-Toe, Connect 4, Gomoku, Reversi, Checkers, Go
- **Game Lobby**: Browse and join available game sessions
- **Match Creation**: Create new games and wait for opponents
- **State Synchronization**: Real-time board state updates
- **Move Validation**: Server-side validation of game moves
- **Win Detection**: Automatic win/tie detection for all game types
- **Player Management**: Track connected players and their game sessions

## Getting Started

### Prerequisites

- Node.js 18+ (for ES modules support)
- npm 9+

### Installation

1. **Install server dependencies**:

```bash
cd server
npm install
```

2. **Install frontend client library**:

```bash
npm install socket.io-client
```

### Running the Server

**Development mode** (with auto-reload):

```bash
cd server
npm run dev
```

**Production mode**:

```bash
cd server
npm run build
npm start
```

The server will start on `http://localhost:3001` by default.

## API Reference

### WebSocket Events

#### Client → Server

**`player:join`** - Join the lobby as a player
```typescript
socket.emit('player:join', playerName: string, (playerId: string, players: Player[]) => void)
```

**`session:list-available`** - List available game sessions
```typescript
socket.emit('session:list-available', (sessions: GameSession[]) => void)
```

**`session:create`** - Create a new game session
```typescript
socket.emit('session:create', gameId: string, (sessionId: string, session: GameSession) => void)
```

**`session:join`** - Join an existing game session
```typescript
socket.emit('session:join', sessionId: string, (sessionId: string, players: Player[]) => void)
```

**`game:ready`** - Signal ready to start the game
```typescript
socket.emit('game:ready')
```

**`game:move`** - Make a move in the game
```typescript
socket.emit('game:move', move: {x: number, y: number}, (result: MoveResult) => void)
```

**`game:resign`** - Resign from the current game
```typescript
socket.emit('game:resign')
```

#### Server → Client

**`connection:established`** - Connection confirmed
```typescript
socket.on('connection:established', (playerId: string) => void)
```

**`session:created`** - Game session created
```typescript
socket.on('session:created', (session: GameSession) => void)
```

**`session:player-joined`** - Player joined the session
```typescript
socket.on('session:player-joined', (player: Player) => void)
```

**`game:start`** - Game started, current player index
```typescript
socket.on('game:start', (currentPlayerIndex: number) => void)
```

**`game:move-made`** - Move was made by a player
```typescript
socket.on('game:move-made', (result: MoveResult) => void)
```

**`game:finished`** - Game finished
```typescript
socket.on('game:finished', (winner: Player | null, isTie: boolean) => void)
```

**`error`** - Server error occurred
```typescript
socket.on('error', (message: string) => void)
```

### REST API Endpoints

**`GET /api/health`** - Server health check
```json
{
  "status": "ok",
  "timestamp": "2024-03-02T10:30:00.000Z"
}
```

**`GET /api/games`** - List available games
```json
{
  "games": [
    {
      "id": "tic-tac-toe",
      "name": "Tic Tac Toe",
      "description": "A simple Tic Tac Toe game.",
      "tags": ["classic", "simple"],
      "boardProps": {
        "width": 3,
        "height": 3,
        "emptyValue": 0
      }
    }
  ],
  "count": 1
}
```

## Frontend Integration

### Using the GameClient SDK

```typescript
import GameClient from './client/GameClient';

const client = new GameClient('http://localhost:3001');

// Connect to server
await client.connect();

// Join lobby
const playerId = await client.joinLobby('PlayerName');

// Create a game session
const { sessionId, session } = await client.createSession('tic-tac-toe');

// Or join an existing session
const availableSessions = await client.listAvailableSessions();
const { players } = await client.joinSession(availableSessions[0].id);

// Signal ready
client.gameReady();

// Listen for game events
client.on('game:start', (currentPlayerIndex) => {
  console.log('Game started! Current player:', currentPlayerIndex);
});

client.on('game:move-made', (result) => {
  console.log('Move result:', result);
});

// Make a move
const result = await client.makeMove({ x: 1, y: 2 });

// Resign
client.resign();

// Disconnect
client.disconnect();
```

## Type Definitions

### GameSession
```typescript
interface GameSession {
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
```

### Player
```typescript
interface Player {
  id: string;
  name: string;
  socketId: string;
  piece: string | number;
}
```

### MoveResult
```typescript
interface MoveResult {
  success: boolean;
  board: (string | number)[];
  currentPlayerIndex: number;
  winner: Player | null;
  isTie: boolean;
  message?: string;
}
```

## Game Rules

### Win Conditions

- **Tic-Tac-Toe**: 3 in a row (horizontally, vertically, or diagonally)
- **Connect 4**: 4 connected pieces
- **Gomoku**: 5 connected pieces
- **Reversi/Checkers/Go**: Game-specific rules (to be implemented)

### Move Validation

- Move coordinates must be within board bounds
- Target cell must be empty
- It must be the player's turn

## Configuration

### Server

Environment variables (optional):
- `PORT`: Server port (default: 3001)

### CORS Settings

The server accepts connections from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative dev server)
- `http://localhost:4173` (Vite preview server)

Modify the CORS origins in `src/index.ts` for production deployments.

## Development

### Running Tests

```bash
cd server
npm run test
```

### Building

```bash
cd server
npm run build
```

Output will be in `dist/`.

### Linting

```bash
npm run lint
```

## Deployment

### Docker

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./
RUN npm ci --only=production

COPY server/dist ./dist
COPY src/defaultGames.json ../src/

EXPOSE 3001

CMD ["node", "dist/index.js"]
```

### Environment

For production, set:
- `NODE_ENV=production`
- `PORT=3001` (or your desired port)
- Update CORS origins for your domain

## Future Enhancements

- [ ] Persistent database (PostgreSQL/MongoDB)
- [ ] Player authentication and profiles
- [ ] Rating system and leaderboards
- [ ] Game chat/messaging
- [ ] AI opponents
- [ ] Replay system
- [ ] Tournament support
- [ ] Mobile app

## Troubleshooting

### Connection Issues

**Problem**: Client can't connect to server
- Ensure server is running: `npm run dev`
- Check CORS settings in `src/index.ts`
- Verify correct server URL in GameClient

**Problem**: Moves not being processed
- Check server console for errors
- Verify player is connected and it's their turn
- Check browser console for WebSocket errors

### Performance

- For production, consider implementing Redis for session management
- Use a database instead of in-memory storage
- Implement rate limiting on move frequency

## Contributing

Pull requests welcome! Please ensure:
1. Code follows existing style (run `npm run lint`)
2. TypeScript has no errors (`npm run build`)
3. New features include appropriate tests

## License

MIT
