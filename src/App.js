import React, { useState, useEffect } from 'react';
import './App.css';

const generateTileSymbol = () => {
  const symbols = ['🍎','🥭','🫐', '🍊', '🍓', '🍐'];
  return symbols[Math.floor(Math.random() * symbols.length)];
};

const createTileGrid = (rows, cols) => {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, generateTileSymbol));
};

const App = () => {
  const [grid, setGrid] = useState(createTileGrid(9, 6));
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timer, setTimer] = useState(60);
  const [hasStarted, setHasStarted] = useState(false);
  const [animationTiles, setAnimationTiles] = useState([]);

  useEffect(() => {
    let interval;
    if (hasStarted && timer > 0 && !isGameOver) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsGameOver(true);
    }
    return () => clearInterval(interval);
  }, [hasStarted, timer, isGameOver]);

  useEffect(() => {
    if (animationTiles.length > 0) {
      const timeout = setTimeout(() => {
        setAnimationTiles([]);
        updateGrid(...animationTiles);
      }, 600);

      return () => clearTimeout(timeout);
    }
  }, [animationTiles]);

  const checkAdjacency = ([x1, y1], [x2, y2]) => {
    return (Math.abs(x1 - x2) === 1 && y1 === y2) || (Math.abs(y1 - y2) === 1 && x1 === x2) ||
           ((y1 !== y2) && (x1 === 0 || grid[x1-1][y1] === '') && (x2 === 0 || grid[x2-1][y2] === ''));
  };

  const updateGrid = ([x1, y1], [x2, y2]) => {
    const updatedGrid = grid.map(row => row.slice());

    updatedGrid[x1][y1] = '';
    updatedGrid[x2][y2] = '';

    for (let y = 0; y < updatedGrid[0].length; y++) {
      let emptySpaces = 0;
      for (let x = updatedGrid.length - 1; x >= 0; x--) {
        if (updatedGrid[x][y] === '') {
          emptySpaces++;
        } else if (emptySpaces > 0) {
          updatedGrid[x + emptySpaces][y] = updatedGrid[x][y];
          updatedGrid[x][y] = '';
        }
      }
      for (let x = 0; x < emptySpaces; x++) {
        updatedGrid[x][y] = generateTileSymbol();
      }
    }
    setGrid(updatedGrid);
    setCurrentScore(prevScore => prevScore + 5);

    setTimer(prevTimer => prevTimer + 1);
  };

  const handleTileSelection = (x, y) => {
    if (isGameOver) return;

    const newSelection = [...selectedTiles, [x, y]];

    if (newSelection.length === 2) {
      const [[x1, y1], [x2, y2]] = newSelection;

      if (checkAdjacency([x1, y1], [x2, y2]) && grid[x1][y1] === grid[x2][y2]) {
        setAnimationTiles([[x1, y1], [x2, y2]]);
      }

      setSelectedTiles([]);
    } else {
      setSelectedTiles(newSelection);
    }
  };

  const restartGame = () => {
    setGrid(createTileGrid(9, 6));
    setCurrentScore(0);
    setTimer(60);
    setIsGameOver(false);
    setHasStarted(false);
  };

  const startGame = () => {
    setHasStarted(true);
  };

  return (
    <div className="app-container">
      {!hasStarted ? (
        <div className="start-screen">
          <h1>Welcome to Tile Connect!</h1>
          <p>Match adjacent tiles to clear them. Try to get the highest score before time runs out!</p>
          <button onClick={startGame} className="action-button">Start Game</button>
        </div>
      ) : (
        <>
          <div className="actions">
            <div className="timer">⏱️ : {timer}s</div>
            <div className="score-display">⭐ : {currentScore} </div>
          </div>
          <div className="tile-grid">
            {grid.map((row, x) => (
              <div key={x} className="grid-row">
                {row.map((tile, y) => (
                  <Tile 
                    key={y} 
                    tile={tile} 
                    onClick={() => handleTileSelection(x, y)} 
                    x={x} 
                    y={y} 
                    selected={selectedTiles.some(([selX, selY]) => selX === x && selY === y)}
                    animate={animationTiles.some(([animX, animY]) => animX === x && animY === y)}
                  />
                ))}
              </div>
            ))}
          </div>
          {isGameOver && (
            <div className="game-over">
              <h2>Game Over</h2>
              <p>Your Score: {currentScore} ⭐</p>
              <button onClick={restartGame} className="action-button">Restart Game</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const Tile = ({ tile, onClick, x, y, selected, animate }) => (
  <button
    id={`tile-${x}-${y}`}
    className={`tile-button ${selected ? 'selected' : ''} ${animate ? 'fadeOut' : ''}`}
    onClick={onClick}
    style={{ visibility: tile ? 'visible' : 'hidden'}}
  >
    {tile}
  </button>
);

export default App;
