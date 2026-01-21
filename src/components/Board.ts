import type { BoardMove, Coordinate } from "../types";
import type { IBoard, IPlayer } from "../interfaces";

import ConnectedCells from "./ConnectedCells";

type ConnectedCellArray <ValueType> = Array<ConnectedCells<ValueType>>;

export class Board<ValueType> implements IBoard<ValueType>
{
  width = 0;
  height = 0;
  emptyValue: ValueType;

  directions = [
    { dx: 1, dy: 0 },  // right
    { dx: -1, dy: 0 }, // left
    { dx: 0, dy: -1 }, // up
    { dx: 0, dy: 1 },  // down
    { dx: 1, dy: 1 },  // down-right
    { dx: 1, dy: -1 }, // up-right
    { dx: -1, dy: 1 }, // down-left
    { dx: -1, dy: -1 } // up-left
  ];

  board: Array<ValueType> = [];
  occupiedCells: Array<Coordinate> = Array<Coordinate>();
  playerConnectedCells : Array<ConnectedCellArray<ValueType>>;
  players: Array<IPlayer<ValueType>>;
  
  constructor(width: number, height: number, emptyValue: ValueType, players: Array<IPlayer<ValueType>>)
  {
    this.width = width;
    this.height = height;
    this.emptyValue = emptyValue;
    this.players = players;
    this.playerConnectedCells = new Array<ConnectedCellArray<ValueType>>(players.length);
    for (let i = 0; i < players.length; i++)
    {
      this.playerConnectedCells[i] = new Array<ConnectedCells<ValueType>>();
    }

    this.board = new Array<ValueType>(width * height);
    this.board.fill(emptyValue);
  }

  getAt(x: number, y: number) : ValueType
  {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height)
    {
      throw new Error(`Error getting cell: board index out of bounds: x: ${x} - width: ${this.width}, y: ${y} - height: ${this.height}`);
    }
    return this.board[y * this.width + x];
  }

  setAt(x: number, y: number, value: ValueType) : void
  {
    console.log(`Setting cell at x: ${x}, y: ${y} to value: ${value}`);

    if (x < 0 || x >= this.width || y < 0 || y >= this.height)
    {
      throw new Error(`Error setting cell: board index out of bounds: x: ${x} - width: ${this.width}, y: ${y} - height: ${this.height}`);
    }
    this.board[y * this.width + x] = value;
    this.occupiedCells.push({ x, y });
  }

  clone() : IBoard<ValueType>
  {
    const emptyValue = this.emptyValue;
    const newBoard = new Board<ValueType>(this.width, this.height, emptyValue, this.players);
    newBoard.board = [...this.board];
    newBoard.occupiedCells = [...this.occupiedCells];
    newBoard.players = [...this.players];
    newBoard.playerConnectedCells = [...this.playerConnectedCells];

    return newBoard;
  }

  isBoardFull() : boolean
  {
    return this.board.length === this.occupiedCells.length;
  }

  // top left is 0,0; low right is width-1,height-1
  getLowestEmptyCellInColumn(column: number, startY: number) : number | null
  {
    if (this.getAt(column, startY) !== this.emptyValue)
    {
      return null;
    }

    for (let y = startY + 1; y < this.height; y++)
    {
      if (this.getAt(column, y) !== this.emptyValue)
      {
        return y - 1;
      }
    }
    if (this.getAt(column, this.height - 1) === this.emptyValue)
    {
      return this.height - 1;
    }
    return null;
  }

  // n cells in a row, column or diagonal unified check
  // 1. go to first non-empty cell
  // 2. check all surrounding cells in 8 directions for a match
  // 3. if match found, continue in that direction up to n cells
  // 4. if n matches found, return true
  // 5. if no matches found, continue to next non-empty cell
  // 6. if end of board reached, return false
  isNConnected(n: number, value: ValueType) : boolean
  {
    const checkedCoords = new Set<Coordinate>();
    for (const coord of this.occupiedCells)
    {
      if (checkedCoords.has(coord))
      {
        continue;
      }
      checkedCoords.add(coord);
      
      const startValue = this.getAt(coord.x, coord.y);
      if (startValue !== value)
      {
        continue;
      }

      let currentDirection = null;
      let count = 1;
      let currentX = coord.x;
      let currentY = coord.y;

      for (const direction of this.directions)
      {
        const neighborX = coord.x + direction.dx;
        const neighborY = coord.y + direction.dy;
        if (neighborX < 0 || neighborX >= this.width || neighborY < 0 || neighborY >= this.height)
        {
          continue;
        }
        if (this.getAt(neighborX, neighborY) === startValue)
        {
          currentDirection = direction;
          currentX = neighborX;
          currentY = neighborY;
          count++;
          break;
        }
      }
      if (currentDirection !== null)
      {
        while (count < n)
        {
          currentX += currentDirection.dx;
          currentY += currentDirection.dy;
          if (currentX < 0 || currentX >= this.width || currentY < 0 || currentY >= this.height)
          {
            break;
          }
          if (this.getAt(currentX, currentY) === startValue)
          {
            count++;
          }
          else
          {
            break;
          }
        }
        if (count === n)
        {
          return true;
        }
      }
    }
    return false;
  }

  applyMove(value: ValueType, move: BoardMove) : boolean
  {
    if (this.getAt(move.x, move.y) === this.emptyValue)
    {
      this.setAt(move.x, move.y, value);
      return true;
    }

    return false;
  }
}

export default Board;