// utils/randomFoodPosition.ts
import { Coordinate } from '../types/types';

export const randomFoodPosition = (
  maxX: number,
  maxY: number,
  occupiedPositions: Coordinate[] = []
): Coordinate => {
  let position: Coordinate;
  do {
    position = {
      x: Math.floor(Math.random() * maxX),
      y: Math.floor(Math.random() * maxY),
    };
  } while (
    occupiedPositions.some((pos) => pos.x === position.x && pos.y === position.y)
  );
  return position;
};
