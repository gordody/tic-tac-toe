import type { Socket } from 'socket.io';
import type { Server } from 'socket.io';
import { GameSession, Player, MovePayload, MoveResult, GameConfig } from '../types';
import gameSessionManager from '../models/GameSessionManager';
import GameEngine from '../services/GameEngine';

export const registerGameHandlers = (
  io: Server,
  socket: Socket,
  allGames: GameConfig[]
) => {
  const playerId = socket.id;

  /**
   * Player joins lobby - creates a new session
   */
  socket.on('player:join', (playerName: string, callback: (id: string, players: Player[]) => void) => {
    console.log(`Player ${playerName} (${playerId}) joined lobby`);

    // Store player info in socket
    socket.data.playerId = playerId;
    socket.data.playerName = playerName;

    callback(playerId, []);
    socket.emit('connection:established', playerId);
  });

  /**
   * List available game sessions
   */
  socket.on('session:list-available', (callback: (sessions: unknown) => void) => {
    const availableSessions = gameSessionManager.listAvailableSessions();
    const sessionsWithoutBoard = availableSessions.map((s) => ({
      ...s,
      board: undefined,
    }));
    callback(sessionsWithoutBoard);
  });

  /**
   * Create a new game session
   */
  socket.on('session:create', (gameId: string, callback: (sessionId: string | null, session: GameSession | null) => void) => {
    const gameConfig = allGames.find((g) => g.id === gameId);
    if (!gameConfig) {
      socket.emit('error', `Game ${gameId} not found`);
      callback(null, null);
      return;
    }

    const playerName = socket.data.playerName || 'Anonymous';
    const player: Player = {
      id: playerId,
      name: playerName,
      socketId: socket.id,
      piece: 1, // Default piece for first player
    };

    const session = gameSessionManager.createSession(gameConfig, [player]);
    socket.join(session.id);
    socket.data.sessionId = session.id;

    console.log(`Created new session ${session.id} for game ${gameId}`);
    callback(session.id, session);
    socket.emit('session:created', session);
  });

  /**
   * Join an existing game session
   */
  socket.on('session:join', (sessionId: string, callback: (sessionId: string | null, players: Player[]) => void) => {
    const session = gameSessionManager.getSession(sessionId);
    if (!session) {
      socket.emit('error', `Session ${sessionId} not found`);
      callback(null, []);
      return;
    }

    if (session.status !== 'waiting') {
      socket.emit('error', 'Game session is not accepting players');
      callback(null, []);
      return;
    }

    if (session.players.length >= 2) {
      socket.emit('error', 'Game session is full');
      callback(null, []);
      return;
    }

    const playerName = socket.data.playerName || 'Anonymous';
    const newPlayer: Player = {
      id: playerId,
      name: playerName,
      socketId: socket.id,
      piece: session.players.length + 1, // Assign piece number based on player index
    };

    session.players.push(newPlayer);
    socket.join(sessionId);
    socket.data.sessionId = sessionId;

    console.log(`Player ${playerName} joined session ${sessionId}`);
    callback(sessionId, session.players);

    // Notify other players
    io.to(sessionId).emit('session:player-joined', newPlayer);
  });

  /**
   * Player signals ready to start game
   */
  socket.on('game:ready', () => {
    const sessionId = socket.data.sessionId;
    if (!sessionId) return;

    const session = gameSessionManager.getSession(sessionId);
    if (!session || session.players.length < 2) {
      socket.emit('error', 'Not enough players to start game');
      return;
    }

    session.status = 'playing';
    session.currentPlayerIndex = 0;

    console.log(`Game session ${sessionId} started`);
    io.to(sessionId).emit('game:start', 0);
  });

  /**
   * Player makes a move
   */
  socket.on('game:move', (move: MovePayload, callback: (result: MoveResult) => void) => {
    const sessionId = socket.data.sessionId;
    if (!sessionId) {
      callback({ success: false, board: [], currentPlayerIndex: 0, winner: null, isTie: false, message: 'No active session' });
      return;
    }

    const session = gameSessionManager.getSession(sessionId);
    if (!session) {
      callback({ success: false, board: [], currentPlayerIndex: 0, winner: null, isTie: false, message: 'Session not found' });
      return;
    }

    const currentPlayer = session.players[session.currentPlayerIndex];
    if (currentPlayer.socketId !== socket.id) {
      callback({ success: false, board: [...session.board], currentPlayerIndex: session.currentPlayerIndex, winner: null, isTie: false, message: 'Not your turn' });
      return;
    }

    // Apply the move
    const moveSuccess = GameEngine.applyMove(session, move.x, move.y);
    if (!moveSuccess) {
      callback({ success: false, board: [...session.board], currentPlayerIndex: session.currentPlayerIndex, winner: null, isTie: false, message: 'Invalid move' });
      return;
    }

    // Check for win
    const winRequirement = GameEngine.getWinRequirement(session.gameConfig.id);
    const playerWon = GameEngine.checkWin(session, currentPlayer, winRequirement);

    if (playerWon) {
      session.status = 'finished';
      session.winner = currentPlayer;
      console.log(`Player ${currentPlayer.name} won session ${sessionId}`);

      const result: MoveResult = {
        success: true,
        board: [...session.board],
        currentPlayerIndex: session.currentPlayerIndex,
        winner: currentPlayer,
        isTie: false,
      };

      callback(result);
      io.to(sessionId).emit('game:move-made', result);
      io.to(sessionId).emit('game:finished', currentPlayer, false);
      return;
    }

    // Check for tie
    if (GameEngine.isBoardFull(session)) {
      session.status = 'finished';
      session.isTie = true;
      console.log(`Game session ${sessionId} ended in a tie`);

      const result: MoveResult = {
        success: true,
        board: [...session.board],
        currentPlayerIndex: session.currentPlayerIndex,
        winner: null,
        isTie: true,
      };

      callback(result);
      io.to(sessionId).emit('game:move-made', result);
      io.to(sessionId).emit('game:finished', null, true);
      return;
    }

    // Move to next player
    session.currentPlayerIndex = GameEngine.getNextPlayer(session);

    const result: MoveResult = {
      success: true,
      board: [...session.board],
      currentPlayerIndex: session.currentPlayerIndex,
      winner: null,
      isTie: false,
    };

    callback(result);
    io.to(sessionId).emit('game:move-made', result);
  });

  /**
   * Player resigns
   */
  socket.on('game:resign', () => {
    const sessionId = socket.data.sessionId;
    if (!sessionId) return;

    const session = gameSessionManager.getSession(sessionId);
    if (!session || session.status === 'finished') return;

    // Find the winner (other player)
    const winner = session.players.find((p) => p.socketId !== socket.id) || null;
    session.status = 'finished';
    session.winner = winner;

    console.log(`Player resigned in session ${sessionId}`);
    io.to(sessionId).emit('game:finished', winner, false);
  });

  /**
   * Handle player disconnect
   */
  socket.on('disconnect', () => {
    const sessionId = socket.data.sessionId;
    if (sessionId) {
      gameSessionManager.removePlayerFromSession(playerId, sessionId);
      io.to(sessionId).emit('session:player-left', playerId);
      console.log(`Player ${socket.data.playerName} disconnected from session ${sessionId}`);
    }
  });
};

export default registerGameHandlers;
