import { useState, useEffect, useCallback } from 'react';

export const useGameStatus = (rowsCleared) => {
  const [score, setScore] = useState(0);
  const [rows, setRows] = useState(0);
  const [level, setLevel] = useState(0);

  const linePoints = [40, 100, 300, 1200];

  const calcScore = useCallback(() => {
    if (rowsCleared > 0) {
      if (rowsCleared <= 4) {
        const points = linePoints[rowsCleared - 1] * (level + 1);
        
        setRows(prev => {
          const newRows = prev + rowsCleared;
          if (newRows >= (level + 1) * 10) {
            setLevel(prev => prev + 1);
          }
          return newRows;
        });

        setScore(prev => prev + points);
      }
    }
  }, [level, rowsCleared]); 

  useEffect(() => {
    calcScore();
  }, [calcScore, rowsCleared]);

  return [score, setScore, rows, setRows, level, setLevel];
};