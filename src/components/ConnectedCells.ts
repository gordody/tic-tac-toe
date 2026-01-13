import type { Coordinate } from "../types";

export type Direction = { dx: number; dy: number };

export class ConnectedCells<ValueType> {
  // Array of coordinates that form the connected set (row, column or diagonal)
  public CellArray: Array<Coordinate>;

  // Direction vector describing the orientation of the connected cells
  public Direction: Direction;

  public valueType: ValueType;

  constructor(cells: Array<Coordinate> = [], direction: Direction = { dx: 0, dy: 0 }, valueType: ValueType) {
    this.CellArray = cells;
    this.Direction = direction;
    this.valueType = valueType;
  }

  // Convenience helpers
  add(cell: Coordinate) {
    this.CellArray.push(cell);
  }

  get length(): number {
    return this.CellArray.length;
  }
}

export default ConnectedCells;
