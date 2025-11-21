import { useState, useReducer } from 'react'
import './App.css'

import type { BoardPlaceValueType, BoardRowType, BoardMove, BoardType } from './types.ts'


interface State {
  player: number;
  playerWon: boolean;
  board: BoardType;
};

type GameAction =
  | { type: "reset" }
  | { type: "move"; value: BoardMove } // State["board"]

const initialState: State = { 
  player: 1,
  playerWon: false,
  board: [
  ['E', 'E', 'E'],
  ['E', 'E', 'E'],
  ['E', 'E', 'E']]
};

function playerToValue(player: number) : BoardPlaceValueType
{
  return player === 1 ? 'X' : 'O';
}

// 3 of the same in a row, column or diagonal
function playerWins(board: BoardType, player: number) : boolean
{
  const playerValue: BoardPlaceValueType = playerToValue(player);

  // rows
  for (let r = 0; r < 3; r++) {
    if (board[r][0] !== 'E' && board[r][0] === board[r][1] && board[r][1] === board[r][2]) {
      return playerValue == board[r][0];
    }
  }
  // cols
  for (let c = 0; c < 3; c++) {
    if (board[0][c] !== 'E' && board[0][c] === board[1][c] && board[1][c] === board[2][c]) {
      return playerValue == board[0][c];
    }
  }
  // diags
  if (board[0][0] !== 'E' && board[0][0] === board[1][1] && board[1][1] === board[2][2]) return playerValue == board[0][0];
  if (board[0][2] !== 'E' && board[0][2] === board[1][1] && board[1][1] === board[2][0]) return playerValue == board[0][2];
  
  return false;
}

function applyMoveToBoard(board: BoardType, player: number, move: BoardMove) : { newBoard: BoardType, newPlayer: number, playerWon: boolean }
{
  // const newBoard: BoardType = [];
  // board.forEach((row: BoardRowType) => {
  //   const newRow = new Array<BoardPlaceValueType>(3);
  //   row.forEach((v: BoardPlaceValueType) => newRow.push(v))
  //   newBoard.push(newRow);
  // });
  const newBoard = JSON.parse(JSON.stringify(board));

  const newValue = playerToValue(player);
  if (newBoard[move.x][move.y] === 'E')
  {
    newBoard[move.x][move.y] = newValue;
  }

  const playerWon = playerWins(board, player);
  const newPlayer = playerWon ? player : (player === 1 ? 2 : 1);

  console.log(move, board, newBoard, player, newPlayer, newValue);

  return { newBoard, newPlayer, playerWon };
}

function stateReducer(state: State, action: GameAction): State {
  switch (action.type) {
    case "reset":
      return initialState;
    case "move":
      {
        const { newBoard, newPlayer, playerWon } = applyMoveToBoard(state.board, state.player, action.value);
        return { player: newPlayer, board: newBoard, playerWon };
      }
    default:
      throw new Error("Unknown action");
  }
}

function App() {
  const [state, dispatch] = useReducer(stateReducer, initialState);
  
  const move = (x: number, y: number) => {
    dispatch({ type: "move", value: { x, y } });
  };
  const reset = () => {
    dispatch({ type: "reset" });
  };

  return (
    <>
      <div>Current Player: {state.player}</div>
      {state.playerWon ? <div>state.player</div> + "won" : ""}
      <table><tbody>
        {state.board.map((row: BoardRowType, rowIndex: number) => {
          return (
            <tr key={`row_${rowIndex}`}>{
            row.map((v: BoardPlaceValueType, colIndex: number) => {
              return (<td key={`cell_${rowIndex}_${colIndex}`}>
                <button disabled={v != 'E'}
                onClick={() => move(rowIndex, colIndex)}>{v}</button>
              </td>);
            })}
            </tr>
          );
        })}
      </tbody>
      </table>
      <div>
        <button onClick={reset}>Restart</button>
      </div>
    </>
  )
}

export default App
