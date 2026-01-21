// app has a gameselector
// when a game is selected it is loaded and played until the player exits
// available games are tic tac toe and connect 4
import React, { useState } from 'react';
import GameSelector from './GameSelector.tsx';
import BoardGame from './components/BoardGame.tsx';
import type { IBoard, MoveResult, GameProps, IPlayer } from './interfaces.ts';
import type { BoardMove, BoardPlaceValueType, EmptyValueType } from './types.ts';

import availableGames from './defaultGames.json';

import './App.css';

const EmptyValue = '' as EmptyValueType;

const players: Array<IPlayer<BoardPlaceValueType>> = [];


// ApplyMove for Connect4:
/*
function applyMoveToBoard(board: Board<BoardPlaceValueType>, player: number, move: BoardMove) : MoveResult<BoardPlaceValueType>
{
  const newBoard = board.clone();
  const newValue = playerToValue(player);

  // use gravity to find the lowest empty cell in the column
  const lowestEmptyCell = newBoard.getLowestEmptyCellInColumn(move.x, move.y);
  if (lowestEmptyCell === null) 
  {
    return { newBoard, newPlayer: player, playerWon: 0, tieGame: false };
  }

  newBoard.applyMove(newValue, { x: move.x, y: lowestEmptyCell });

  const playerWon = playerWins(newBoard, newValue) ? player : 0;
  const newPlayer = playerWon ? player : (player === 1 ? 2 : 1);
  const tieGame = newBoard.isBoardFull() && !playerWon;

  if (playerWon !== 0) 
  {
    console.log(`Player ${player} wins!`);
  }
  if (tieGame)
  {
    console.log(`Game tied!`);
  }

  return { newBoard, newPlayer, playerWon, tieGame };
}
// For gomoku:
function applyMoveToBoard(board: Board<BoardPlaceValueType>, player: number, move: BoardMove) : MoveResult<BoardPlaceValueType>
{
  const newBoard = board.clone();
  const newValue = playerToValue(player);

  if (newBoard.applyMove(newValue, move) === false)
  {
    return { newBoard, newPlayer: player, playerWon: 0, tieGame: false };
  }

  const playerWon = playerWins(newBoard, newValue) ? player : 0;
  const newPlayer = playerWon ? player : (player === 1 ? 2 : 1);
  const tieGame = newBoard.isBoardFull() && !playerWon;

  if (playerWon !== 0) 
  {
    console.log(`Player ${player} wins!`);
  }
  if (tieGame)
  {
    console.log(`Game tied!`);
  }

  return { newBoard, newPlayer, playerWon, tieGame };
}
 */

// game loop:
// 1. player makes a move
// 2. check for win or tie
// 3. switch players
// 4. repeat until win or tie
function gameLoop(applyMoveFn, processMoveFn, playerWinFn, board: IBoard<BoardPlaceValueType>, players: Array<IPlayer<BoardPlaceValueType>>)
{
  // get current player
  const nPlayers = players.length;
  let currentPlayerIndex = 0;

  while (true)
  {
    const currentPlayer = players[currentPlayerIndex];

    // get move from player (this would be from UI in a real app)
    const move: BoardMove = { x: 0, y: 0 }; // placeholder

    // apply move to board
    // const result = applyMoveToBoard(board, currentPlayer, move);

    // check for win or tie
    // if (result.playerWon) { console.log(`${currentPlayer.name} wins!`); break; }
    // if (result.tieGame) { console.log(`It's a tie!`); break; }

    // switch players
    currentPlayerIndex = (currentPlayerIndex + 1) % nPlayers;
  }
}

function applyMoveToBoard(board: IBoard<BoardPlaceValueType>, player: IPlayer<BoardPlaceValueType>, move: BoardMove) : MoveResult<BoardPlaceValueType>
{
  const newBoard = board.clone();
  const newValue = player.piece;

  if (newBoard.applyMove(newValue, move) === false)
  {
    return { newBoard, newPlayer: player, playerWon: 0, tieGame: false };
  }

  const playerWon = playerWins(newBoard, newValue) ? player : 0;
  const newPlayer = playerWon ? player : (player === 1 ? 2 : 1);
  const tieGame = newBoard.isBoardFull() && !playerWon;

  if (playerWon !== 0) 
  {
    console.log(`Player ${player} wins!`);
  }
  if (tieGame)
  {
    console.log(`Game tied!`);
  }

  return { newBoard, newPlayer, playerWon, tieGame };
}

const playerWinFns: { [key: string]: (board: IBoard<BoardPlaceValueType>, value: BoardPlaceValueType) => boolean } = {
  'tic-tac-toe': (board: IBoard<BoardPlaceValueType>, value: BoardPlaceValueType) => board.isNConnected(3, value),
  'connect-4': (board: IBoard<BoardPlaceValueType>, value: BoardPlaceValueType) => board.isNConnected(4, value),
  'gomoku': (board: IBoard<BoardPlaceValueType>, value: BoardPlaceValueType) => board.isNConnected(5, value),
};

type InitialStateType = {
  width: number;
  height: number;
  emptyValue: BoardPlaceValueType;
};
  
const gameInitialStates: { [key: string]: InitialStateType } = {
  'tic-tac-toe': {
    width: 3,
    height: 3,
    emptyValue: EmptyValue,
  },
  'connect-4': {
    width: 7,
    height: 6,
    emptyValue: EmptyValue,
  },
  'gomoku': {
    width: 15,
    height: 15,
    emptyValue: EmptyValue,
  },
};

const gameMoveFunctions: { [key: string]: (board: any, player: number, move: any) => any } = {
  // 'tic-tac-toe': applyMoveToTicTacToeBoard,
  // 'connect-4': applyMoveToConnect4Board,
  // 'gomoku': applyMoveToGomokuBoard,
};

const getGameProps = (gameId: string) : GameProps<any> => {
  const initialState = gameInitialStates[gameId];
  const playerWinFn = playerWinFns[gameId];

  return {
    width: initialState.width,
    height: initialState.height,
    emptyValue: initialState.emptyValue,
    playerWinFn: playerWinFn,
  };
}


const App: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const handleSelectGame = (gameId: string) => {
    setSelectedGame(gameId);
  };

  const handleExitGame = () => {
    setSelectedGame(null);
  };

  return (
    <div className="app-container">
      <div className="app-title">Grid Games</div>

      {!selectedGame ? (
        <GameSelector games={availableGames} onSelectGame={handleSelectGame} />
      ) : selectedGame === 'tic-tac-toe' ? (
        <BoardGame width={3} height={3} emptyValue={null} onExit={handleExitGame} />
      // ) : selectedGame === 'connect-4' ? (
      //   <Connect4Game onExit={handleExitGame} />
      // ) : selectedGame === 'gomoku' ? (
      //   <GomokuGame onExit={handleExitGame} />
      ) : null}
    </div>
  );
};

export default App;