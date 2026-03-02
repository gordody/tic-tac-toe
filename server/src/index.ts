import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import registerGameHandlers from './handlers/gameHandlers';
import type { GameConfig } from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Load games configuration
const gamesPath = path.join(__dirname, '../..', 'src', 'defaultGames.json');
let allGames: GameConfig[] = [];

try {
  const gamesData = fs.readFileSync(gamesPath, 'utf-8');
  allGames = JSON.parse(gamesData);
  console.log(`Loaded ${allGames.length} games from configuration`);
} catch (error) {
  console.error('Failed to load games configuration:', error);
  allGames = [];
}

// REST API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/games', (req, res) => {
  res.json({
    games: allGames,
    count: allGames.length,
  });
});

// WebSocket connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  registerGameHandlers(io, socket, allGames);

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🎮 Game server running on http://localhost:${PORT}`);
  console.log(`📊 Available games: ${allGames.map((g) => g.name).join(', ')}`);
});
