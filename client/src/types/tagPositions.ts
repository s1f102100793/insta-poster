export type TagPosition = "左下" | "右下" | "左上" | "右上" | "中央下";

export const tagPositions: TagPosition[] = [
  "左下",
  "右下",
  "左上",
  "右上",
  "中央下",
];

export const translateTagPositionToEnglish = (
  tagPosition: TagPosition,
): string => {
  const positionMap: { [key in TagPosition]: string } = {
    左下: "bottom-left",
    右下: "bottom-right",
    左上: "top-left",
    右上: "top-right",
    中央下: "bottom-center",
  };
  return positionMap[tagPosition];
};
