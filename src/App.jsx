import React, { useState, useCallback, useEffect, useRef } from 'react';
import Board from './components/Board';
import { createStage, checkCollision } from './gameHelpers/gameHelpers';
import { usePlayer } from './hooks/usePlayer';
import { useGameStatus } from './hooks/useGameStatus';
import './App.css';

// Custom hook for interval
const useInterval = (callback, delay) => {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

const App = () => {
  const [stage, setStage] = useState(createStage());
  const [gameOver, setGameOver] = useState(false);
  const [dropTime, setDropTime] = useState(null);
  const [rowsCleared, setRowsCleared] = useState(0);

  const [player, updatePlayerPos, resetPlayer, playerRotate] = usePlayer();
  const [score, setScore, rows, setRows, level, setLevel] = useGameStatus(rowsCleared);

  // Interval for game loop
  useInterval(() => {
    drop();
  }, dropTime);

  const movePlayer = (dir) => {
    if (!checkCollision(player, stage, { x: dir, y: 0 })) {
      updatePlayerPos({ x: dir, y: 0 });
    }
  };

  const startGame = () => {
    setStage(createStage());
    resetPlayer();
    setGameOver(false);
    setDropTime(1000);
    setScore(0);
    setRows(0);
    setLevel(0);
  };

  const updateStage = useCallback(prevStage => {
    // First flush the stage
    const newStage = prevStage.map(row =>
      row.map(cell => (cell[1] === 'clear' ? [0, 'clear'] : cell))
    );

    // Then draw the tetromino
    player.tetromino.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          newStage[y + player.pos.y][x + player.pos.x] = [
            value,
            `${player.collided ? 'merged' : 'clear'}`,
          ];
        }
      });
    });

    // Check if we collided
    if (player.collided) {
      resetPlayer();
      const sweptRows = sweepRows(newStage);
      return sweptRows;
    }

    return newStage;
  }, [player]);

  useEffect(() => {
    setStage(prev => updateStage(prev));
  }, [player, updateStage]);

  const drop = () => {
    // Increase level when player has cleared 10 rows
    if (rows > (level + 1) * 10) {
      setLevel(prev => prev + 1);
      // Also increase speed
      setDropTime(1000 / (level + 1) + 200);
    }

    if (!checkCollision(player, stage, { x: 0, y: 1 })) {
      updatePlayerPos({ x: 0, y: 1, collided: false });
    } else {
      if (player.pos.y < 1) {
        setGameOver(true);
        setDropTime(null);
        return;
      }
      updatePlayerPos({ x: 0, y: 0, collided: true });
    }
  };

  // Clear completed rows
  const sweepRows = useCallback(
    (newStage) => {
      setRowsCleared(0); 
      let rowsToAdd = 0;
      const stage = newStage.reduce((acc, row) => {
        if (row.findIndex((cell) => cell[0] === 0) === -1) {
          rowsToAdd += 1;
          acc.unshift(new Array(newStage[0].length).fill([0, 'clear']));
          return acc;
        }
        acc.push(row);
        return acc;
      }, []);
      
      if (rowsToAdd > 0) {
        setRowsCleared(rowsToAdd);
      }
      
      return stage;
    },
    []
  );

  const dropPlayer = () => {
    setDropTime(null);
    drop();
  };

  const keyUp = ({ keyCode }) => {
    if (!gameOver && keyCode === 40) {
      setDropTime(1000 / (level + 1) + 200);
    }
  };

  const move = (event) => {
    if (!gameOver) {
      if (event.keyCode === 37) {
        movePlayer(-1);
        event.preventDefault();
      } else if (event.keyCode === 39) {
        movePlayer(1);
        event.preventDefault();
      } else if (event.keyCode === 40) {
        dropPlayer();
        event.preventDefault();
      } else if (event.keyCode === 38) {
        playerRotate(stage, 1);
        event.preventDefault();
      }
    }
  };

  
  useEffect(() => {
    startGame();
  }, []);

  return (
    <div 
      className="App" 
      role="button" 
      tabIndex="0" 
      onKeyDown={move}
      onKeyUp={keyUp}
      autoFocus
      onBlur={(e) => e.currentTarget.focus()}
      onMouseDown={(e) => {
        e.preventDefault();
        e.currentTarget.focus();
      }}
    >
      <div className="game">
        {gameOver ? (
          <div className="game-over">
            <h2>Game Over</h2>
            <button onClick={startGame}>Jugar de nuevo</button>
          </div>
        ) : (
          <div className="game-area">
            <Board board={stage} />
            <div className="side-panel">
              <div className="game-stats">
                <p>Puntuación: {score}</p>
                <p>Filas: {rows}</p>
                <p>Nivel: {level}</p>
              </div>
              <button onClick={startGame}>Jugar de nuevo</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
