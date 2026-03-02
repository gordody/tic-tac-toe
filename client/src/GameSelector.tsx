// a set of tiles representing different game options.
import React, { useEffect, useState } from 'react';
import './GameSelector.css';

interface GameOption {
  id: string;
  name: string;
  description: string;
  tags: string[];
  imageUrl: string;
}

interface GameSelectorProps {
  games: GameOption[];
  onSelectGame: (gameId: string) => void;
}

// const GameSelector: React.FC<GameSelectorProps> = ({ games, onSelectGame }) => {
//   return (
//     <div className="game-selector">
//       {games.map(game => (
//         <div key={game.id} className="game-tile" onClick={() => onSelectGame(game.id)}>
//           <img src={game.imageUrl} alt={game.name} className="game-image" />
//           <h3 className="game-name">{game.name}</h3>
//           <p className="game-description">{game.description}</p>
//         </div>
//       ))}
//     </div>
//   );
// };

const GameSelector: React.FC<GameSelectorProps> = ({ games, onSelectGame }) => {
  const [gamesDisplayType, setGamesDisplayType] = useState('grid'); // 'grid' or 'list'
  const [availableGames, setAvailableGames] = useState(games);
  const [refreshCount, setRefreshCount] = useState(0); // To trigger re-render on refresh
  
  const toggleDisplayType = () => {
    setGamesDisplayType(gamesDisplayType === 'grid' ? 'list' : 'grid');
  };

  const refreshGamesList = () => {
    // Placeholder for refreshing games list logic, e.g., re-fetching from an API or resetting to default games.
    console.log('Refreshing games list...');
    setRefreshCount(refreshCount + 1); // Trigger re-render
  }

  useEffect(() => {
    // This effect could be used to fetch games from an API or reset to default games on refresh.
    // For now, it just logs the refresh action.
    console.log('Games list refreshed. Current count:', refreshCount);
    fetch('/api/games')
      .then(response => response.json())
      .then(data => setAvailableGames(data))
      .catch(error => {
        console.error('Error fetching games:', error);
        // Fallback to default games if API call fails
        setAvailableGames(games);
      });
  }, [refreshCount, games]);

  const renderGameTile = (game: GameOption) => (
    <div key={game.id} className="game-tile" onClick={() => onSelectGame(game.id)}>
      <img src={game.imageUrl} alt={game.name} className="game-image" />
      <h3 className="game-name">{game.name}</h3>
      <p className="game-description">{game.description}</p>
    </div>
  );

  const renderGameListItem = (game: GameOption) => (
    <div key={game.id} className="game-list-item" onClick={() => onSelectGame(game.id)}>
      <img src={game.imageUrl} alt={game.name} className="game-image-list" />
      <div className="game-info">
        <h3 className="game-name">{game.name}</h3>
        <p className="game-description">{game.description}</p>
      </div>
    </div>
  );

  return (
    <div className={`game-selector ${gamesDisplayType}`}>
      <button onClick={toggleDisplayType}>
        {gamesDisplayType === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
      </button>
      <button onClick={refreshGamesList}>Refresh Games List</button>

      {availableGames.map(game => (
        gamesDisplayType === 'grid' ? renderGameTile(game) : renderGameListItem(game)
      ))}

    </div>
  );
};

export default GameSelector;
