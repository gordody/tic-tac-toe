import type { BoardMove, BoardPlaceValueType } from "./types";
export type PlayerType = 'NPC' | 'Human';

export interface IPlayer<ValueType> {
  id: string;        // unique identifier
  name: string;      // display name
  piece: ValueType;
  playerType: PlayerType;
}

export interface IBoard<ValueType> {
  width: number;
  height: number;
  
  getAt(x: number, y: number): ValueType;
  setAt(x: number, y: number, value: ValueType): void;
  clone(): IBoard<ValueType>;
  isBoardFull(): boolean;
  getLowestEmptyCellInColumn(column: number, startY: number): number | null;
  isNConnected(n: number, value: ValueType): boolean;
  applyMove(value: ValueType, move: BoardMove): boolean;
}

export type MoveResult<BoardPlaceValueType> =
{ 
  newBoard: IBoard<BoardPlaceValueType>, 
  newPlayer: IPlayer<BoardPlaceValueType>, 
  playerWon: number,
  tieGame: boolean 
}

export interface GameState {
  player: number;
  playerWon: number;
  tieGame: boolean;
  board: IBoard<BoardPlaceValueType>;
  players: Array<IPlayer<BoardPlaceValueType>>;
};
export interface GameProps {
  initialState: GameState;
  gameState: GameState;
  onMove: (move: BoardMove) => void;
  onReset: () => void;
  onExit: () => void;
}
