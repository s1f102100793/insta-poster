import { match, P } from "ts-pattern";

export type TagPosition =
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  | "top-left"
  | "top-center"
  | "top-right";

export const getPositionCoordinates = (
  position: TagPosition,
  index: number,
): { x: number; y: number } => {
  const basePosition = {
    "bottom-left": { x: 0.25, y: 0.75 },
    "bottom-center": { x: 0.5, y: 0.75 },
    "bottom-right": { x: 0.75, y: 0.75 },
    "top-left": { x: 0.25, y: 0.25 },
    "top-center": { x: 0.5, y: 0.25 },
    "top-right": { x: 0.75, y: 0.25 },
  };

  const offset = 0.05 * index;

  const adjustedY = match(position)
    .with(
      P.string.startsWith("bottom"),
      () => basePosition[position].y - offset,
    )
    .with(P.string.startsWith("top"), () => basePosition[position].y + offset)
    .otherwise(() => basePosition[position].y);

  return {
    x: basePosition[position].x,
    y: adjustedY,
  };
};
