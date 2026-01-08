// app has a gameselector
// when a game is selected it is loaded and played until the player exits
// available games are tic tac toe and connect 4
import React, { useState } from 'react';
import GameSelector from './GameSelector.tsx';
import TicTacToeGame from './components/TicTacToeGame.tsx';
import Connect4Game from './components/Connect4Game.tsx';
import GomokuGame from './components/GomokuGame.tsx';

import availableGames from './defaultGames.json';


const App: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const handleSelectGame = (gameId: string) => {
    setSelectedGame(gameId);
  };

  const handleExitGame = () => {
    setSelectedGame(null);
  };

  return (
    <div className="app-container">
      {!selectedGame ? (
        <GameSelector games={availableGames} onSelectGame={handleSelectGame} />
      ) : selectedGame === 'tic-tac-toe' ? (
        <TicTacToeGame onExit={handleExitGame} />
      ) : selectedGame === 'connect-4' ? (
        <Connect4Game onExit={handleExitGame} />
      ) : selectedGame === 'gomoku' ? (
        <GomokuGame onExit={handleExitGame} />
      ) : null}
    </div>
  );
};

export default App;