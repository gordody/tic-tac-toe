export type XValueType = 'X';
export type OValueType = 'O';
export type EmptyValueType = 'E';
export type BoardPlaceValueType = XValueType | OValueType | EmptyValueType;
export type Coordinate = { x: number, y: number };
export type BoardMove = Coordinate;

