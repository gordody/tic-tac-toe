import type { BoardMove, BoardPlaceValueType } from './types';
export type PlayerType = 'NPC' | 'Human';

export interface IPlayer<ValueType> {
  id: string; // unique identifier
  name: string; // display name
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

export type MoveResult<BoardPlaceValueType> = {
  newBoard: IBoard<BoardPlaceValueType>;
  newPlayer: IPlayer<BoardPlaceValueType>;
  playerWon: IPlayer<BoardPlaceValueType> | null;
  tieGame: boolean;
};

export interface GameState {
  player: IPlayer<BoardPlaceValueType>;
  playerWon: IPlayer<BoardPlaceValueType> | null;
  tieGame: boolean;
  board: IBoard<BoardPlaceValueType>;
  players: Array<IPlayer<BoardPlaceValueType>>;

  getNextPlayerFn: (currentPlayer: IPlayer<BoardPlaceValueType>, players: Array<IPlayer<BoardPlaceValueType>>) => IPlayer<BoardPlaceValueType>;
  playerWinFn: (board: IBoard<BoardPlaceValueType>, value: BoardPlaceValueType) => boolean;
  processMoveFn: (board: IBoard<BoardPlaceValueType>, move: BoardMove) => BoardMove;
  applyMoveToBoardFn: (
    board: IBoard<BoardPlaceValueType>,
    player: IPlayer<BoardPlaceValueType>,
    players: Array<IPlayer<BoardPlaceValueType>>,
    move: BoardMove,
    getNextPlayerFn: (currentPlayer: IPlayer<BoardPlaceValueType>, players: Array<IPlayer<BoardPlaceValueType>>) => IPlayer<BoardPlaceValueType>,
    processMoveFn: (board: IBoard<BoardPlaceValueType>, move: BoardMove) => BoardMove,
    playerWinFn: (board: IBoard<BoardPlaceValueType>, value: BoardPlaceValueType) => boolean
  ) => MoveResult<BoardPlaceValueType>;
}
export interface GameProps {
  initialState: GameState;

  onExit: () => void;
}
