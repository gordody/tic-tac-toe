export type BoardPlaceValueType = 'X' | 'O' | 'E';
export type BoardRowType = Array<BoardPlaceValueType>;
export type BoardMove = { x: number, y: number };
export type BoardType = Array<BoardRowType>;
