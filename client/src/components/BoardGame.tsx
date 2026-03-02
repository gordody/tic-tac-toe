import { useReducer } from 'react';
import Grid from './Grid.tsx';
import './BoardGame.css';
import type { GameProps, GameState, IBoard } from '../interfaces.ts';

import type { BoardPlaceValueType, BoardMove } from '../types.ts';

type GameAction =
  | { type: 'reset'; value: GameState } // resets to the state specified (usually gameProps.initialState)
  | { type: 'move'; value: BoardMove }; // State["board"]

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
const BoardGameGrid: React.FC<BoardGameGridProps> = ({ board, boardActive = true, moveHandler }) => {
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
      cell.style.background = '#e6f7ff';
      setTimeout(() => {
        cell.style.background = prevBg;
      }, 180);

      moveHandler(x, y);
    }
  };

  return (
    <div>
      <Grid rows={rows} cols={cols} cellSize={64} gap={6} renderCell={renderCell} onGridClick={onGridClick} />
    </div>
  );
};

function stateReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'reset':
      return action.value;
    case 'move': {
      if (state.playerWon !== null || state.tieGame) {
        return state; // no more moves allowed
      }
      
      const res = state.applyMoveToBoardFn(state.board, state.player, state.players, action.value, state.getNextPlayerFn, state.processMoveFn, state.playerWinFn);
      console.log(`Move applied: player ${state.player.name} to x: ${action.value.x}, y: ${action.value.y}`);
      console.log(`Move result: new player ${res.newPlayer.name}, player won: ${res.playerWon ? res.playerWon.name : 'none'}, tie game: ${res.tieGame}`);

      return {
        player: res.newPlayer,
        board: res.newBoard,
        playerWon: res.playerWon,
        tieGame: res.tieGame,
        players: state.players,
        playerWinFn: state.playerWinFn,
        processMoveFn: state.processMoveFn,
        applyMoveToBoardFn: state.applyMoveToBoardFn,
        getNextPlayerFn: state.getNextPlayerFn,
      };
    }
    default:
      throw new Error('Unknown action');
  }
}

function BoardGame(props: GameProps) {
  const [state, dispatch] = useReducer(stateReducer, props.initialState);

  const move = (x: number, y: number) => {
    dispatch({ type: 'move', value: { x, y } });
  };
  const reset = () => {
    dispatch({ type: 'reset', value: props.initialState });
  };
  const exit = () => {
    props.onExit();
  };

  const boardActive = !state.playerWon && !state.tieGame;

  return (
    <>
      <div>Current Player: {state.player.name}</div>
      {state.playerWon !== null ? <div>{state.playerWon.name} won</div> : ''}
      {state.tieGame ? <div>Game tied</div> : ''}
      <BoardGameGrid board={state.board} boardActive={boardActive} moveHandler={move} />
      <div>
        <button onClick={reset}>Restart</button>
      </div>
      <div>
        <button onClick={exit}>Exit</button>
      </div>
    </>
  );
}

export default BoardGame;
