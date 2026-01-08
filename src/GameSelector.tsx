// a set of tiles representing different game options.
import React from 'react';
import './GameSelector.css';

interface GameOption {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

interface GameSelectorProps {
  games: GameOption[];
  onSelectGame: (gameId: string) => void;
}

const GameSelector: React.FC<GameSelectorProps> = ({ games, onSelectGame }) => {
  return (
    <div className="game-selector">
      {games.map((game) => (
        <div
          key={game.id}
          className="game-tile"
          onClick={() => onSelectGame(game.id)}
        >
          <img src={game.imageUrl} alt={game.name} className="game-image" />
          <h3 className="game-name">{game.name}</h3>
          <p className="game-description">{game.description}</p>
        </div>
      ))}
    </div>
  );
};

export default GameSelector;
