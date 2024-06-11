export type MemberName =
  | "てつや"
  | "しばゆー"
  | "りょう"
  | "としみつ"
  | "ゆめまる"
  | "虫眼鏡";

export const memberNames: MemberName[] = [
  "てつや",
  "しばゆー",
  "りょう",
  "としみつ",
  "ゆめまる",
  "虫眼鏡",
];

export const memberColors: Record<MemberName, string> = {
  てつや: "bg-orange-200",
  しばゆー: "bg-yellow-200",
  りょう: "bg-blue-200",
  としみつ: "bg-green-200",
  ゆめまる: "bg-pink-200",
  虫眼鏡: "bg-yellow-900",
};
