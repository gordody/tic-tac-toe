// app has a gameselector
// when a game is selected it is loaded and played until the player exits
// available games are tic tac toe and connect 4
import React, { useState } from 'react';
import GameSelector from './GameSelector.tsx';
import BoardGame from './components/BoardGame.tsx';
import type { IBoard, MoveResult, GameProps, GameState, IPlayer } from './interfaces.ts';
import type { BoardMove, BoardPlaceValueType, EmptyValueType } from './types.ts';

import availableGames from '../../common/defaultGames.json';

import './App.css';
import { Board } from './components/Board.ts';

const EmptyValue = '' as EmptyValueType;

const players: Array<IPlayer<BoardPlaceValueType>> = [];

function applyMoveFn(
  board: IBoard<BoardPlaceValueType>,
  player: IPlayer<BoardPlaceValueType>,
  players: Array<IPlayer<BoardPlaceValueType>>,
  move: BoardMove,
  getNextPlayerFn: (currentPlayer: IPlayer<BoardPlaceValueType>, players: Array<IPlayer<BoardPlaceValueType>>) => IPlayer<BoardPlaceValueType>,
  processMoveFn: (board: IBoard<BoardPlaceValueType>, move: BoardMove) => BoardMove,
  playerWinFn: (board: IBoard<BoardPlaceValueType>, value: BoardPlaceValueType) => boolean
): MoveResult<BoardPlaceValueType> {
  const newBoard = board.clone();

  const processedMove = processMoveFn(newBoard, move);
  if (processedMove === null) {
    return { newBoard, newPlayer: player, playerWon: null, tieGame: false };
  }

  newBoard.applyMove(player.piece, processedMove);

  const playerWon = playerWinFn(newBoard, player.piece) ? player : null;
  let newPlayer = player;
  if (!playerWon) {
    newPlayer = getNextPlayerFn(player, players);
  }
  const tieGame = newBoard.isBoardFull() && !playerWon;

  if (playerWon !== null) {
    console.log(`Player ${playerWon.name} wins!`);
  }
  if (tieGame) {
    console.log(`Game tied!`);
  }

  return { newBoard, newPlayer, playerWon, tieGame };
}

const getNextPlayerFn = (currentPlayer: IPlayer<BoardPlaceValueType>, players: Array<IPlayer<BoardPlaceValueType>>): IPlayer<BoardPlaceValueType> => {
  const nPlayers = players.length;
  const currentPlayerIndex = players.findIndex(player => player.id === currentPlayer.id);
  const newPlayer = players[(currentPlayerIndex + 1) % nPlayers];
  console.log(`Next player: ${currentPlayerIndex} of ${players.length} ${newPlayer.name}`);

  return newPlayer;
}

const playerWinFns: { [key: string]: (board: IBoard<BoardPlaceValueType>, value: BoardPlaceValueType) => boolean } = {
  'tic-tac-toe': (board: IBoard<BoardPlaceValueType>, value: BoardPlaceValueType) => board.isNConnected(3, value),
  'connect-4': (board: IBoard<BoardPlaceValueType>, value: BoardPlaceValueType) => board.isNConnected(4, value),
  'gomoku': (board: IBoard<BoardPlaceValueType>, value: BoardPlaceValueType) => board.isNConnected(5, value),
};

const processMoveFns: { [key: string]: (board: IBoard<BoardPlaceValueType>, move: BoardMove) => BoardMove } = {
  'tic-tac-toe': (_board: IBoard<BoardPlaceValueType>, move: BoardMove) => move,
  'connect-4': (board: IBoard<BoardPlaceValueType>, move: BoardMove) => ({ x: move.x, y: board.getLowestEmptyCellInColumn(move.x, move.y) ?? move.y } as BoardMove),
  'gomoku': (_board: IBoard<BoardPlaceValueType>, move: BoardMove) => move,
};

const getGameProps = (gameId: string): GameProps => {
  const currGame = availableGames.find(game => game.id === gameId);
  if (!currGame) {
    throw new Error(`Game with id ${gameId} not found`);
  }
  if (players.length === 0) {
    // Initialize players based on the game. For simplicity, we assume 2 players for all games here.
    players.push({ id: 'player1', name: 'Player 1', piece: 'X', playerType: 'Human' });
    players.push({ id: 'player2', name: 'Player 2', piece: 'O', playerType: 'Human' });
  }

  const playerWinFn = playerWinFns[gameId];
  const initialBoard = new Board<BoardPlaceValueType>(
    currGame.boardProps.width,
    currGame.boardProps.height,
    EmptyValue,
    players
  );

  const gameState: GameState = {
    player: players[0], // placeholder, should be set to the first player in the players array for the game
    playerWon: null,
    tieGame: false,
    board: initialBoard, // should be initialized to an empty board of the correct size for the game
    players: players, // should be set to the correct players for the game
    getNextPlayerFn: getNextPlayerFn,
    playerWinFn: playerWinFn,
    processMoveFn: processMoveFns[gameId],
    applyMoveToBoardFn: applyMoveFn,
  };

  return {
    initialState: gameState,
    onExit: () => { },
  };
};

const App: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const handleSelectGame = (gameId: string) => {
    setSelectedGame(gameId);
  };

  const handleExitGame = () => {
    setSelectedGame(null);
  };

  const gameProps = getGameProps(selectedGame || 'tic-tac-toe');
  gameProps.onExit = handleExitGame;

  return (
    <div className="app-container">
      <div className="app-title">Grid Games</div>

      {!selectedGame ? (
        <GameSelector games={availableGames} onSelectGame={handleSelectGame} />
      ) : (
        <BoardGame {...gameProps} />
      )}
    </div>
  );
};

export default App;
