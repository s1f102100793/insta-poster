export type TagPosition = "bottom-left" | "bottom-right" | "top-right" | "top-left";

export const tagPositions: { label: string; value: TagPosition }[] = [
  { label: "左下", value: "bottom-left" },
  { label: "右下", value: "bottom-right" },
  { label: "右上", value: "top-right" },
  { label: "左上", value: "top-left" },
];