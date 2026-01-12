import Board, { Board } from "./Board";
import type { BoardMove, BoardPlaceValueType, Coordinate, EmptyValueType, OValueType, XValueType } from "../types";


/* tslint:disable:no-unused-variable */ // for default class methods

const PlayerToValueMap: { [key: number]: BoardPlaceValueType } = {
  1: 'X' as XValueType,
  2: 'O' as OValueType,
};

const EmptyValue = '' as EmptyValueType;

export type BoardGameMoveResult<BoardPlaceValueType> =
{ 
  newBoard: Board<BoardPlaceValueType>, 
  newPlayer: number, 
  playerWon: number,
  tieGame: boolean 
}

export interface IBoardGame<ValueType> {
  width: number;
  height: number;

  playerToValue(player: number): BoardPlaceValueType;
  isCellEmpty(value: BoardPlaceValueType): boolean;
  playerWins(board: Board<BoardPlaceValueType>, value: BoardPlaceValueType): boolean;

  emptyValue: ValueType | null;
  occupiedCells: Array<Coordinate>;

  getAt(x: number, y: number): ValueType;
  setAt(x: number, y: number, value: ValueType): void;

}

export class BoardGame<ValueType> implements IBoardGame<ValueType> {
  // delegate to the existing Board implementation
  public board: Board<ValueType>;

  constructor(width: number, height: number, emptyValue: ValueType) {
    this.board = new Board<ValueType>(width, height, emptyValue);
  }

  get width(): number {
    return this.board.width;
  }

  get height(): number {
    return this.board.height;
  }

  get emptyValue(): ValueType | null {
    return this.board.emptyValue;
  }

  get occupiedCells(): Array<Coordinate> {
    return this.board.occupiedCells;
  }

  getAt(x: number, y: number): ValueType {
    return this.board.getAt(x, y);
  }

  setAt(x: number, y: number, value: ValueType): void {
    this.board.setAt(x, y, value);
  }

  playerToValue(player: number) : BoardPlaceValueType
  {
    return PlayerToValueMap[player];
  }

  isCellEmpty(value: BoardPlaceValueType) : boolean
  {
    return value === EmptyValue;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  playerWins(_board: Board<BoardPlaceValueType>, _value: BoardPlaceValueType) : boolean
  {
    return false;
  }

  applyMoveToBoard(board: Board<BoardPlaceValueType>, player: number, move: BoardMove) : BoardGameMoveResult<BoardPlaceValueType>
  {
    const newBoard = board.clone();

    const newValue = this.playerToValue(player);
    if (this.isCellEmpty(newBoard.getAt(move.x, move.y)))
    {
      newBoard.setAt(move.x, move.y, newValue);
    }

    const playerWon = this.playerWins(newBoard, newValue) ? player : 0;
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

}

export default BoardGame;
