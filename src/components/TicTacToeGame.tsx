import { useReducer } from 'react'
import Grid from './Grid.tsx';
import Board from './Board.ts';
import './TicTacToeGame.css'
import type { GameProps } from '../interfaces.ts';

import type { XValueType, OValueType, EmptyValueType, BoardPlaceValueType, BoardMove } from '../types.ts';

// Tic-Tac-Toe game logic
// 3x3 grid, 2 players (X and O), take turns
// one wins by connecting 3 in a row, column, or diagonal

const BoardWidth = 3;
const BoardHeight = 3;

const PlayerToValueMap: { [key: number]: BoardPlaceValueType } = {
  1: 'X' as XValueType,
  2: 'O' as OValueType,
};

const EmptyValue = '' as EmptyValueType;

type GameAction =
  | { type: "reset" }
  | { type: "move"; value: BoardMove } // State["board"]

interface State {
  player: number;
  playerWon: number;
  tieGame: boolean;
  board: Board<BoardPlaceValueType>;
};

const initialState: State = { 
  player: 1,
  playerWon: 0,
  tieGame: false,
  board: new Board<BoardPlaceValueType>(BoardWidth, BoardHeight, EmptyValue),
};

function playerToValue(player: number) : BoardPlaceValueType
{
  return PlayerToValueMap[player];
}

function isCellEmpty(value: BoardPlaceValueType) : boolean
{
  return value === EmptyValue;
}

// 3 of the same in a row, column or diagonal
function playerWins(board: Board<BoardPlaceValueType>, value: BoardPlaceValueType) : boolean
{
  return board.isNConnected(3, value);
}

function applyMoveToBoard(board: Board<BoardPlaceValueType>, player: number, move: BoardMove) : { 
  newBoard: Board<BoardPlaceValueType>, 
  newPlayer: number, 
  playerWon: number,
  tieGame: boolean }
{
  const newBoard = board.clone();

  const newValue = playerToValue(player);
  if (isCellEmpty(newBoard.getAt(move.x, move.y)))
  {
    newBoard.setAt(move.x, move.y, newValue);
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

interface BoardGameGridProps {
  rows?: number;
  cols?: number;
  board: Board<BoardPlaceValueType>;
  boardActive?: boolean;
  moveHandler: (x: number, y: number) => void;
}

/* 
  Refining / Specializing Grid
  Usage: use `renderCell` and `onGridClick`.
   - Click or focus+Enter/Space a cell to toggle X → O → empty.
   - `onGridClick` shows receiving the DOM cell element and coords.
*/
const BoardGameGrid: React.FC<BoardGameGridProps> = ({
  rows = BoardHeight,
  cols = BoardWidth,
  board,
  boardActive = true,
  moveHandler,
}) => {

  const renderCell = (r: number, c: number) => {
    return board.getAt(r, c);
  };

  const onGridClick = (cell: HTMLDivElement | null, x?: number, y?: number) => {
    if (x === undefined || y === undefined) return;
    if (!boardActive) return;

    // Briefly highlight the clicked cell
    if (cell) {
      const prevBg = cell.style.background;
      cell.style.background = "#e6f7ff";
      setTimeout(() => {
        cell.style.background = prevBg;
      }, 180);

      moveHandler(x, y);
    }
  };

  return (
    <div>
      <Grid
        rows={rows}
        cols={cols}
        cellSize={64}
        gap={6}
        renderCell={renderCell}
        onGridClick={onGridClick}
      />
    </div>
  );
};

function stateReducer(state: State, action: GameAction): State {
  switch (action.type) {
    case "reset":
      return initialState;
    case "move":
      {
        if (state.playerWon !== 0 || state.tieGame) 
        {
          return state; // no more moves allowed
        }

        const { newBoard, newPlayer, playerWon, tieGame } = applyMoveToBoard(state.board, state.player, action.value);
        return { player: newPlayer, board: newBoard, playerWon, tieGame };
      }
    default:
      throw new Error("Unknown action");
  }
}

function TicTacToeGame(gameProps: GameProps) {
  const [state, dispatch] = useReducer(stateReducer, initialState);
  
  const move = (x: number, y: number) => {
    dispatch({ type: "move", value: { x, y } });
  };
  const reset = () => {
    dispatch({ type: "reset" });
  };
  const exit = () => {
    gameProps.onExit();
  };

  return (
    <>
      <div>Current Player: {state.player}</div>
      {state.playerWon !== 0 ? <div>{state.player} won</div>  : ""}
      {state.tieGame ? <div>Game tied</div>  : ""}

      <BoardGameGrid rows={BoardHeight} cols={BoardWidth} board={state.board} boardActive={!state.playerWon} moveHandler={move} />
      <div>
        <button onClick={reset}>Restart</button>
      </div>
      <div>
        <button onClick={exit}>Exit</button>
      </div>
    </>
  )
}

export default TicTacToeGame;
