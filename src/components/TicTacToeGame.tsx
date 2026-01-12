import { useReducer } from 'react'
import Grid from './Grid.tsx';
import Board from './Board.ts';
import './TicTacToeGame.css'
import type { GameProps } from '../interfaces.ts';

import type { BoardPlaceValueType, BoardMove } from '../types.ts';


const BoardWidth = 3;
const BoardHeight = 3;

interface State {
  player: number;
  playerWon: boolean;
  board: Board<BoardPlaceValueType>;
};

type GameAction =
  | { type: "reset" }
  | { type: "move"; value: BoardMove } // State["board"]

const initialState: State = { 
  player: 1,
  playerWon: false,
  board: new Board<BoardPlaceValueType>(BoardWidth, BoardHeight, 'E'),
};

function playerToValue(player: number) : BoardPlaceValueType
{
  return player === 1 ? 'X' : 'O';
}

function isCellEmpty(value: BoardPlaceValueType) : boolean
{
  return value === 'E';
}

// 3 of the same in a row, column or diagonal
function playerWins(board: Board<BoardPlaceValueType>, value: BoardPlaceValueType) : boolean
{
  return board.isNConnected(3, value);

  // // rows
  // for (let x = 0; x < BoardWidth; x++) 
  // {
  //   if (!isCellEmpty(board.getAt(x, 0)) && board.getAt(x, 0) === board.getAt(x, 1) && board.getAt(x, 1) === board.getAt(x, 2)) {
  //     return true;
  //   }
  // }
  // // cols
  // for (let y = 0; y < BoardHeight; y++) {
  //   if (!isCellEmpty(board.getAt(0, y)) && board.getAt(0, y) === board.getAt(1, y) && board.getAt(1, y) === board.getAt(2, y)) {
  //     return true;
  //   }
  // }
  // // diags
  // if (!isCellEmpty(board.getAt(0, 0)) && board.getAt(0, 0) === board.getAt(1, 1) && board.getAt(1, 1) === board.getAt(2, 2)) return true;
  // if (!isCellEmpty(board.getAt(0, 2)) && board.getAt(0, 2) === board.getAt(1, 1) && board.getAt(1, 1) === board.getAt(2, 0)) return true;
  
  // return false;
}

function applyMoveToBoard(board: Board<BoardPlaceValueType>, player: number, move: BoardMove) : { newBoard: Board<BoardPlaceValueType>, newPlayer: number, playerWon: boolean }
{
  const newBoard = board.clone();

  const newValue = playerToValue(player);
  if (isCellEmpty(newBoard.getAt(move.x, move.y)))
  {
    newBoard.setAt(move.x, move.y, newValue);
  }

  const playerWon = playerWins(newBoard, newValue);
  const newPlayer = playerWon ? player : (player === 1 ? 2 : 1);

  if (playerWon) {
    console.log(`Player ${player} wins!`);
  }

  return { newBoard, newPlayer, playerWon };
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
        if (state.playerWon) 
        {
          return state; // no more moves allowed
        }

        const { newBoard, newPlayer, playerWon } = applyMoveToBoard(state.board, state.player, action.value);
        return { player: newPlayer, board: newBoard, playerWon };
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
      {state.playerWon ? <div>{state.player} won</div>  : ""}

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
