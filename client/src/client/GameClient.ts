import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import type { GameSession, Player, MovePayload, MoveResult } from './types';

/**
 * Client SDK for connecting to the multiplayer game server
 */
export class GameClient {
  private socket: Socket | null = null;
  private serverUrl: string;

  constructor(serverUrl: string = 'http://localhost:3001') {
    this.serverUrl = serverUrl;
  }

  /**
   * Connect to the game server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.serverUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('Connected to game server');
        resolve();
      });

      this.socket.on('connect_error', (error: unknown) => {
        console.error('Connection error:', error);
        reject(error);
      });

      this.socket.on('error', (message: string) => {
        console.error('Server error:', message);
      });
    });
  }

  /**
   * Disconnect from the server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Join the lobby as a player
   */
  joinLobby(playerName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('player:join', playerName, (playerId: string) => {
        console.log('Joined lobby as:', playerId);
        resolve(playerId);
      });
    });
  }

  /**
   * List available game sessions
   */
  listAvailableSessions(): Promise<Omit<GameSession, 'board'>[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('session:list-available', (sessions: Omit<GameSession, 'board'>[]) => {
        resolve(sessions);
      });
    });
  }

  /**
   * Create a new game session
   */
  createSession(gameId: string): Promise<{ sessionId: string; session: GameSession }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('session:create', gameId, (sessionId: string | null, session: GameSession | null) => {
        if (!sessionId || !session) {
          reject(new Error('Failed to create session'));
        } else {
          resolve({ sessionId, session });
        }
      });
    });
  }

  /**
   * Join an existing game session
   */
  joinSession(sessionId: string): Promise<{ sessionId: string; players: Player[] }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit(
        'session:join',
        sessionId,
        (returnedSessionId: string | null, players: Player[]) => {
          if (!returnedSessionId) {
            reject(new Error('Failed to join session'));
          } else {
            resolve({ sessionId: returnedSessionId, players });
          }
        }
      );
    });
  }

  /**
   * Signal ready to start the game
   */
  gameReady(): void {
    if (!this.socket) return;
    this.socket.emit('game:ready');
  }

  /**
   * Make a move in the game
   */
  makeMove(move: MovePayload): Promise<MoveResult> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('game:move', move, (result: MoveResult) => {
        resolve(result);
      });
    });
  }

  /**
   * Resign from the current game
   */
  resign(): void {
    if (!this.socket) return;
    this.socket.emit('game:resign');
  }

  /**
   * Register listener for server events
   */
  on(event: string, callback: (...args: unknown[]) => void): void {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }

  /**
   * Remove listener for server events
   */
  off(event: string, callback: (...args: unknown[]) => void): void {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// Export singleton instance
export const gameClient = new GameClient();

export default GameClient;
