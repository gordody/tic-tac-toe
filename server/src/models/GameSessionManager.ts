import { GameSession, Player, GameConfig } from '../types.js';

// In-memory game session storage
class GameSessionManager {
  private sessions: Map<string, GameSession> = new Map();
  private playerToSession: Map<string, string> = new Map(); // playerId -> sessionId mapping

  createSession(gameConfig: GameConfig, players: Player[]): GameSession {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const board = new Array(gameConfig.boardProps.width * gameConfig.boardProps.height).fill(
      gameConfig.boardProps.emptyValue
    );

    const session: GameSession = {
      id: sessionId,
      gameConfig,
      players,
      board,
      currentPlayerIndex: 0,
      status: 'waiting',
      winner: null,
      isTie: false,
      createdAt: new Date(),
      moves: [],
    };

    this.sessions.set(sessionId, session);
    players.forEach((p) => this.playerToSession.set(p.id, sessionId));

    return session;
  }

  getSession(sessionId: string): GameSession | undefined {
    return this.sessions.get(sessionId);
  }

  getSessionByPlayerId(playerId: string): GameSession | undefined {
    const sessionId = this.playerToSession.get(playerId);
    return sessionId ? this.sessions.get(sessionId) : undefined;
  }

  updateSession(sessionId: string, updates: Partial<GameSession>): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      Object.assign(session, updates);
    }
  }

  removeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.players.forEach((p) => this.playerToSession.delete(p.id));
    }
    this.sessions.delete(sessionId);
  }

  listAvailableSessions(): GameSession[] {
    return Array.from(this.sessions.values()).filter((s) => s.status === 'waiting' && s.players.length < 2);
  }

  listActiveSessions(): GameSession[] {
    return Array.from(this.sessions.values()).filter((s) => s.status === 'playing');
  }

  removePlayerFromSession(playerId: string, sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.players = session.players.filter((p) => p.id !== playerId);
      if (session.players.length === 0) {
        this.removeSession(sessionId);
      }
    }
    this.playerToSession.delete(playerId);
  }
}

export default new GameSessionManager();
