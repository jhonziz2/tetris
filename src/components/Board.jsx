import React from 'react';
import { TETROMINOS } from '../gameHelpers/tetrominos';

const Board = ({ board }) => {
  return (
    <div className="board">
      {board.map((row, y) => (
        <div key={y} className="row">
          {row.map((cell, x) => {
            const [type, cellState] = cell;
            const color = type !== 0 ? `rgb(${TETROMINOS[type].color})` : 'transparent';
            return (
              <div
                key={x}
                className={`cell ${cellState !== 'clear' ? 'filled' : ''}`}
                style={{
                  backgroundColor: color
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Board;