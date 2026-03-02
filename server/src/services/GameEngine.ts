import { GameSession, Player } from '../types';

export class GameEngine {
  /**
   * Validates and applies a move to the board
   */
  static applyMove(session: GameSession, x: number, y: number): boolean {
    const { width, height } = session.gameConfig.boardProps;

    // Validate coordinates
    if (x < 0 || x >= width || y < 0 || y >= height) {
      return false;
    }

    // Check if cell is empty
    const index = y * width + x;
    if (session.board[index] !== session.gameConfig.boardProps.emptyValue) {
      return false;
    }

    // Place the piece
    const currentPlayer = session.players[session.currentPlayerIndex];
    session.board[index] = currentPlayer.piece;

    // Record the move
    session.moves.push({
      playerIndex: session.currentPlayerIndex,
      x,
      y,
      timestamp: new Date(),
    });

    return true;
  }

  /**
   * Check if a player has won (N-in-a-row)
   */
  static checkWin(session: GameSession, currentPlayer: Player, requiredConnected: number = 3): boolean {
    const { width, height } = session.gameConfig.boardProps;
    const board = session.board;
    const piece = currentPlayer.piece;

    // Find position of last move
    const lastMove = session.moves[session.moves.length - 1];
    if (!lastMove) return false;

    const { x, y } = lastMove;

    // 8 directions: horizontal, vertical, and both diagonals
    const directions = [
      { dx: 1, dy: 0 }, // horizontal
      { dx: 0, dy: 1 }, // vertical
      { dx: 1, dy: 1 }, // diagonal down-right
      { dx: 1, dy: -1 }, // diagonal up-right
    ];

    for (const { dx, dy } of directions) {
      let count = 1; // Include the current piece

      // Check forward direction
      for (let i = 1; i < requiredConnected; i++) {
        const nx = x + dx * i;
        const ny = y + dy * i;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) break;
        if (board[ny * width + nx] === piece) {
          count++;
        } else {
          break;
        }
      }

      // Check backward direction
      for (let i = 1; i < requiredConnected; i++) {
        const nx = x - dx * i;
        const ny = y - dy * i;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) break;
        if (board[ny * width + nx] === piece) {
          count++;
        } else {
          break;
        }
      }

      if (count >= requiredConnected) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if board is full (tie game)
   */
  static isBoardFull(session: GameSession): boolean {
    const { width, height } = session.gameConfig.boardProps;
    const expectedLength = width * height;
    return session.moves.length === expectedLength;
  }

  /**
   * Get the next player
   */
  static getNextPlayer(session: GameSession): number {
    const nextIndex = (session.currentPlayerIndex + 1) % session.players.length;
    return nextIndex;
  }

  /**
   * Get win requirement based on game type (Gomoku = 5, Connect4 = 4, TicTacToe = 3)
   */
  static getWinRequirement(gameId: string): number {
    switch (gameId) {
      case 'gomoku':
        return 5;
      case 'connect-4':
        return 4;
      default:
        return 3;
    }
  }
}

export default GameEngine;
