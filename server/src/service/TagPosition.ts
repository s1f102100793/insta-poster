export type TagPosition = 'bottom-left' | 'bottom-right' | 'top-right' | 'top-left' | 'bottom-center';

export const getPositionCoordinates = (position: TagPosition, index: number): { x: number, y: number } => {
  const basePosition = {
    'bottom-left': { x: 0.25, y: 0.75 },
    'bottom-right': { x: 0.75, y: 0.75 },
    'top-right': { x: 0.75, y: 0.25 },
    'top-left': { x: 0.25, y: 0.25 },
    'bottom-center': { x: 0.5, y: 0.75 }
  };

  const offset = 0.05 * index; 
  let adjustedY;

  if (position.startsWith('bottom')) {
    adjustedY = basePosition[position].y - offset;
  } else if (position.startsWith('top')) {
    adjustedY = basePosition[position].y + offset;
  } else {
    adjustedY = basePosition[position].y;
  }

  return {
    x: basePosition[position].x,
    y: adjustedY
  };
};
