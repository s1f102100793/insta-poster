 export type MemberName = 'てつや' | 'しばゆー' | 'りょう' | 'としみつ' | 'ゆめまる' | '虫眼鏡';

const memberNameToRomaji: Record<MemberName, string> = {
  てつや: "Tetsuya",
  しばゆー: "Shibayu",
  りょう: "Ryo",
  としみつ: "Toshimitsu",
  ゆめまる: "Yumemaru",
  虫眼鏡: "Mushimegane"
};

export const convertToRomaji = (memberName: MemberName): string => {
  return memberNameToRomaji[memberName] || "Unknown";
};

const memberNameToInstagramId: Record<MemberName, string> = {
  てつや: "to_tetsuya",
  しばゆー: "to___shibayu",
  りょう: "to_ryoo",
  としみつ: "toshimitsu_tokaionair",
  ゆめまる: "yumemaru_original",
  虫眼鏡: "to_mushimegane"
};

export const convertToInstagramId = (memberName: MemberName): string | undefined=> {
  return memberNameToInstagramId[memberName] || undefined;
};