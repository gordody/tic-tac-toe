import { useEffect, useState } from 'react';
import GameClient from './GameClient';
import type { GameSession, Player } from './types';

/**
 * Example hook for connecting to the multiplayer game server
 */
export const useGameServer = (serverUrl: string = 'http://localhost:3001') => {
  const [client] = useState(() => new GameClient(serverUrl));
  const [isConnected, setIsConnected] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Connect to server on mount
  useEffect(() => {
    const connect = async () => {
      try {
        await client.connect();
        setIsConnected(true);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect');
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      client.disconnect();
    };
  }, [client]);

  // Join lobby
  const joinLobby = async (playerName: string) => {
    try {
      const id = await client.joinLobby(playerName);
      setPlayerId(id);
      setError(null);
      return id;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to join lobby';
      setError(msg);
      throw err;
    }
  };

  // List available sessions
  const listSessions = async () => {
    try {
      const availableSessions = await client.listAvailableSessions();
      setSessions(availableSessions as GameSession[]);
      setError(null);
      return availableSessions;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to list sessions';
      setError(msg);
      throw err;
    }
  };

  // Create new session
  const createSession = async (gameId: string) => {
    try {
      const { session } = await client.createSession(gameId);
      setCurrentSession(session);
      setError(null);
      return session;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create session';
      setError(msg);
      throw err;
    }
  };

  // Join session
  const joinSession = async (sessionId: string) => {
    try {
      const { players: sessionPlayers } = await client.joinSession(sessionId);
      setPlayers(sessionPlayers);
      setError(null);
      return sessionPlayers;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to join session';
      setError(msg);
      throw err;
    }
  };

  // Make move
  const makeMove = async (x: number, y: number) => {
    try {
      const result = await client.makeMove({ x, y });
      setError(null);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to make move';
      setError(msg);
      throw err;
    }
  };

  // Signal ready
  const readyUp = () => {
    client.gameReady();
  };

  // Resign
  const resign = () => {
    client.resign();
  };

  return {
    isConnected,
    playerId,
    sessions,
    currentSession,
    players,
    error,
    joinLobby,
    listSessions,
    createSession,
    joinSession,
    makeMove,
    readyUp,
    resign,
    onEvent: (event: string, callback: (...args: unknown[]) => void) => client.on(event, callback),
  };
};

export default useGameServer;
