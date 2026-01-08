export class Board<ValueType>
{
  width = 0;
  height = 0;
  emptyValue: ValueType | null = null;

  board: Array<ValueType> = [];
  
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
  }

  clone() : Board<ValueType>
  {
    const emptyValue = this.emptyValue || this.board[0]; // TODO: better way to get empty value

    const newBoard = new Board<ValueType>(this.width, this.height, emptyValue);
    newBoard.board = [...this.board];
    return newBoard;
  }
}

export default Board;