import { useReducer } from 'react'
import Grid from './Grid.tsx';
import './BoardGame.css'
import type { GameProps, GameState, IBoard, MoveResult } from '../interfaces.ts';

import type { XValueType, OValueType, BoardPlaceValueType, BoardMove } from '../types.ts';
import { Board } from './Board.ts';


const PlayerToValueMap: { [key: number]: BoardPlaceValueType } = {
  1: 'X' as XValueType,
  2: 'O' as OValueType,
};

type GameAction =
  | { type: "reset"; value: GameState } // resets to the state specified (usually gameProps.initialState)
  | { type: "move"; value: BoardMove }  // State["board"]


function playerToValue(player: number) : BoardPlaceValueType
{
  return PlayerToValueMap[player];
}

// 3 of the same in a row, column or diagonal
function playerWins(board: Board<BoardPlaceValueType>, value: BoardPlaceValueType) : boolean
{
  return board.isNConnected(3, value);
}

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

interface BoardGameGridStyles {
  backgroundColor?: string;
  borderColor?: string;
  cellColor?: string;
  cellHoverColor?: string;
  cellFontColor?: string;
  cellSize?: number;
  gap?: number;
}

interface BoardGameGridProps {
  board: IBoard<BoardPlaceValueType>;
  boardGameGridStyles?: BoardGameGridStyles;
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
  board,
  boardActive = true,
  moveHandler,
}) => {

  const rows = board.height;
  const cols = board.width;

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

function stateReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "reset":
      return action.value;
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

function BoardGame(props: GameProps) {
  const [state, dispatch] = useReducer(stateReducer, props.initialState);
  
  const move = (x: number, y: number) => {
    dispatch({ type: "move", value: { x, y } });
  };
  const reset = () => {
    dispatch({ type: "reset", value: props.initialState });
  };
  const exit = () => {
    props.onExit();
  };

  const boardActive = !state.playerWon && !state.tieGame;

  return (
    <>
      <div>Current Player: {state.player}</div>
      {state.playerWon !== 0 ? <div>{state.player} won</div>  : ""}
      {state.tieGame ? <div>Game tied</div>  : ""}
      <BoardGameGrid board={state.board} boardActive={boardActive} moveHandler={move} />
      <div>
        <button onClick={reset}>Restart</button>
      </div>
      <div>
        <button onClick={exit}>Exit</button>
      </div>
    </>
  )
}

export default BoardGame;
