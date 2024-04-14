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
