import type { IPlayer } from "../interfaces";

export type PlayerType = 'NPC' | 'Human';

export class Player<ValueType> implements IPlayer<ValueType> {
  public id: string;        // unique identifier
  public name: string;      // display name
  public piece: ValueType;
  public playerType: PlayerType;

  constructor(id: string, name: string, piece: ValueType, playerType: PlayerType = 'Human') {
    this.id = id; 
    this.name = name;
    this.piece = piece;
    this.playerType = playerType;
  }
}

export default Player;
