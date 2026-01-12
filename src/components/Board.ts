import type { Coordinate } from "../types";

export class Board<ValueType>
{
  width = 0;
  height = 0;
  emptyValue: ValueType | null = null;

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
  
  constructor(width: number, height: number, emptyValue: ValueType)
  {
    this.width = width;
    this.height = height;
    this.emptyValue = emptyValue;

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
    if (x < 0 || x >= this.width || y < 0 || y >= this.height)
    {
      throw new Error(`Error setting cell: board index out of bounds: x: ${x} - width: ${this.width}, y: ${y} - height: ${this.height}`);
    }
    this.board[y * this.width + x] = value;
    this.occupiedCells.push({ x, y });
  }

  clone() : Board<ValueType>
  {
    const emptyValue = this.emptyValue || this.board[0]; // TODO: better way to get empty value

    const newBoard = new Board<ValueType>(this.width, this.height, emptyValue);
    newBoard.board = [...this.board];
    return newBoard;
  }

  isBoardFull() : boolean
  {
    return this.board.length === this.occupiedCells.length;
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
}

export default Board;