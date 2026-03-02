import type { IPlayer } from '../interfaces';

export type PlayerType = 'NPC' | 'Human';

export class Player<ValueType> implements IPlayer<ValueType> {
  readonly id: string; // unique identifier
  readonly name: string; // display name
  readonly piece: ValueType;
  readonly playerType: PlayerType;

  constructor(id: string, name: string, piece: ValueType, playerType: PlayerType = 'Human') {
    this.id = id;
    this.name = name;
    this.piece = piece;
    this.playerType = playerType;
  }
}

export default Player;
