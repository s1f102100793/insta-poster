export type TagPosition = 'bottom-left' | 'bottom-right' | 'top-right' | 'top-left';

export const getPositionCoordinates = (position: TagPosition) => {
  switch (position) {
    case "bottom-left": return { x: 0.25, y: 0.75 };
    case "bottom-right": return { x: 0.75, y: 0.75 };
    case "top-right": return { x: 0.75, y: 0.25 };
    case "top-left": return { x: 0.25, y: 0.25 };
    default: return { x: 0.5, y: 0.5 };
  }
};
