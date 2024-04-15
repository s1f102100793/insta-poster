const memberNameToRomaji: Record<string, string> = {
  てつや: "Tetsuya",
  しばゆー: "Shibayu",
  りょう: "Ryo",
  としみつ: "Toshimitsu",
  ゆめまる: "Yumemaru",
  虫眼鏡: "Mushimegane"
};

export const convertToRomaji = (memberName: string): string => {
  return memberNameToRomaji[memberName] || "Unknown";
};

const memberNameToInstagramId: Record<string, string> = {
  てつや: "to_tetsuya",
  しばゆー: "to___shibayu",
  りょう: "to_ryoo",
  としみつ: "toshimitsu_tokaionair",
  ゆめまる: "yumemaru_original",
  虫眼鏡: "to_mushimegane"
};

export const convertToInstagramId = (memberName: string): string | undefined=> {
  return memberNameToInstagramId[memberName] || undefined;
};