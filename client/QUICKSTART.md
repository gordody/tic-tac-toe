# Quick Start Guide - Multi-Player Game Backend

This guide will get you up and running with the multi-player game server and client.

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- npm 9+

## Step 1: Install Dependencies

### Frontend (main directory)
```bash
npm install
```

### Backend (server directory)
```bash
cd server
npm install
cd ..
```

## Step 2: Start the Servers

Open two terminal windows:

### Terminal 1 - Backend Server
```bash
cd server
npm run dev
```

You should see:
```
🎮 Game server running on http://localhost:3001
📊 Available games: Tic Tac Toe, Connect 4, Gomoku, Reversi, Checkers, Go
```

### Terminal 2 - Frontend Dev Server
```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

## Step 3: Test the Connection

1. Open browser to `http://localhost:5173/`
2. Open browser console (F12 → Console tab)

## Step 4: Example Usage

Here's how to integrate the game server with a React component:

### Using the GameClient SDK

```typescript
import { useEffect, useState } from 'react';
import GameClient from './client/GameClient';

export function GameLobby() {
  const [client] = useState(() => new GameClient());
  const [players, setPlayers] = useState([]);
  const [playerId, setPlayerId] = useState(null);

  useEffect(() => {
    const setup = async () => {
      // Connect to server
      await client.connect();

      // Join lobby
      const id = await client.joinLobby('YourPlayerName');
      setPlayerId(id);

      // Listen for events
      client.on('session:player-joined', (player) => {
        console.log('Player joined:', player);
        setPlayers(prev => [...prev, player]);
      });
    };

    setup().catch(console.error);

    return () => client.disconnect();
  }, [client]);

  return <div>Player ID: {playerId}</div>;
}
```

### Using the useGameServer Hook

```typescript
import { useGameServer } from './client/useGameServer';

export function GameRoom() {
  const gameServer = useGameServer();

  useEffect(() => {
    if (gameServer.isConnected) {
      gameServer.joinLobby('MyPlayer');
    }
  }, [gameServer.isConnected]);

  if (!gameServer.isConnected) {
    return <div>Connecting...</div>;
  }

  return (
    <div>
      <p>Player ID: {gameServer.playerId}</p>
      <p>Connected Players: {gameServer.players.length}</p>
      {gameServer.error && <p style={{ color: 'red' }}>{gameServer.error}</p>}
    </div>
  );
}
```

## Step 5: Full Game Flow Example

```typescript
import { useEffect, useState } from 'react';
import { useGameServer } from './client/useGameServer';

export function MultiplayerGame() {
  const server = useGameServer();
  const [gameStarted, setGameStarted] = useState(false);
  const [board, setBoard] = useState([]);
  const [winner, setWinner] = useState(null);

  // Initialize
  useEffect(() => {
    if (server.isConnected && !server.playerId) {
      server.joinLobby('Player_' + Math.random().toString(36).slice(7));
    }
  }, [server.isConnected, server.playerId]);

  // Listen for game events
  useEffect(() => {
    server.onEvent('game:start', (playerIndex) => {
      console.log('Game started! You are player', playerIndex);
      setGameStarted(true);
    });

    server.onEvent('game:move-made', (result) => {
      setBoard(result.board);
      if (result.winner) {
        setWinner(result.winner);
      }
    });

    server.onEvent('game:finished', (winner_, isTie) => {
      console.log(isTie ? 'Tie game!' : 'Winner:', winner_?.name);
    });
  }, [server]);

  const handleCreateGame = async () => {
    await server.createSession('tic-tac-toe');
    server.readyUp();
  };

  const handleMove = async (x, y) => {
    const result = await server.makeMove({ x, y });
    if (!result.success) {
      console.error(result.message);
    }
  };

  return (
    <div>
      {!server.playerId && <p>Connecting...</p>}
      {server.playerId && !gameStarted && (
        <button onClick={handleCreateGame}>Create Game</button>
      )}
      {gameStarted && (
        <div>
          <p>Board Size: {Math.sqrt(board.length)} x {Math.sqrt(board.length)}</p>
          {board && board.map((cell, i) => (
            <button
              key={i}
              onClick={() => {
                const size = Math.sqrt(board.length);
                handleMove(i % size, Math.floor(i / size));
              }}
            >
              {cell || '·'}
            </button>
          ))}
          {winner && <p>Winner: {winner.name}</p>}
        </div>
      )}
    </div>
  );
}
```

## API Endpoints

### REST APIs

**Check server health:**
```bash
curl http://localhost:3001/api/health
```

**List available games:**
```bash
curl http://localhost:3001/api/games
```

## WebSocket Events

### Creating a Game Session

```typescript
// Client joins lobby
socket.emit('player:join', 'PlayerName', (playerId) => {
  console.log('Joined:', playerId);
});

// Client creates new game
socket.emit('session:create', 'tic-tac-toe', (sessionId, session) => {
  console.log('Created session:', sessionId);
});

// Second player joins
socket.emit('session:join', sessionId, (sid, players) => {
  console.log('Joined session with players:', players);
});

// Both players signal ready
socket.emit('game:ready');

// Server sends start event
socket.on('game:start', (currentPlayerIndex) => {
  console.log('Game started! Current player:', currentPlayerIndex);
});
```

### Making Moves

```typescript
// Send move
socket.emit('game:move', { x: 1, y: 2 }, (result) => {
  console.log('Move result:', result);
  // {
  //   success: true,
  //   board: [...],
  //   currentPlayerIndex: 1,
  //   winner: null,
  //   isTie: false
  // }
});

// Listen for moves
socket.on('game:move-made', (result) => {
  updateUI(result.board);
  if (result.winner) {
    alert(`${result.winner.name} won!`);
  }
});
```

## Supported Games

- **Tic-Tac-Toe** (3x3 board) - Win: 3 in a row
- **Connect 4** (7x6 board) - Win: 4 connected pieces
- **Gomoku** (15x15 board) - Win: 5 in a row
- **Reversi** (8x8 board)
- **Checkers** (8x8 board)
- **Go** (19x19 board)

Use the game ID in `session:create`:
```typescript
server.createSession('tic-tac-toe');   // or 'connect-4', 'gomoku', etc.
```

## Troubleshooting

### Server won't start
- Ensure backend dependencies are installed: `cd server && npm install`
- Check if port 3001 is available: `lsof -i :3001`
- Try: `npm run build` then `npm start`

### Client can't connect
- Backend server running? (`http://localhost:3001/api/health`)
- Frontend and backend running simultaneously?
- Check browser console for errors (F12 → Console)
- Verify WebSocket: Open DevTools → Network → WS filter

### Moves not registering
- Check it's your turn
- Verify cell is empty (not already occupied)
- Look for server error messages in backend console

## Next Steps

1. **Integrate with existing components**: Update `BoardGame.tsx` to use `useGameServer` hook
2. **Add player authentication**: Store player profiles and ratings
3. **Implement chat**: Add real-time messaging between players
4. **Deploy**: Follow [server README](./server/README.md) for production setup
5. **Add AI**: Implement NPC opponents

## Performance Tips

- Keep game board size reasonable (3x3 to 15x15)
- Limit concurrent sessions (implement rate limiting)
- For production, use Redis for session caching
- Consider database persistence for replay/history

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Port 5173)                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  React Components                                │   │
│  │  ├─ GameLobby.tsx (list sessions)               │   │
│  │  ├─ GameRoom.tsx (waiting for players)          │   │
│  │  └─ MultiplayerGame.tsx (gameplay)              │   │
│  └──────────────────────────────────────────────────┘   │
│         ▲                                             │   │
│         │ WebSocket (Socket.IO)                      │   │
│         │ HTTP REST                                  │   │
│         ▼                                             │   │
└─────────────────────────────────────────────────────────┘
                       │
              ┌────────┴────────┐
              │                 │
      ┌──────▼──────┐   ┌──────▼──────┐
      │ Server 1    │   │ Server N    │
      │ (Port 3001) │   │ (Port 3001) │
      ├─────────────┤   ├─────────────┤
      │ Express     │   │ Express     │
      │ Socket.IO   │   │ Socket.IO   │
      │ GameEngine  │   │ GameEngine  │
      └─────────────┘   └─────────────┘
```

## Support

For issues, check:
1. [Server README](./server/README.md)
2. Browser console (F12 → Console)
3. Server logs (terminal running `npm run dev`)
4. WebSocket inspector in DevTools

---

Happy gaming! 🎮
