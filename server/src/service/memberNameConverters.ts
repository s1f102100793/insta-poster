import { Member } from "../api";
import { TagPosition } from "../sns/instagram/getPositionCoordinates";

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

export const parseMembersData = (formData: FormData): Member[] => {
  const membersData: Member[] = [];
  for (let key of formData.keys()) {
      const match = key.match(/members\[(\d+)\]\[(memberName|tagPosition)\]/);
      if (match) {
          const index = parseInt(match[1], 10);
          const property = match[2] as keyof Member;
          if (!membersData[index]) {
              membersData[index] = { memberName: "", tagPosition: "" };
          }
          const value = formData.get(key);
          if (typeof value === "string" && property === "memberName") {
              membersData[index].memberName = value as MemberName;
          } else if (typeof value === "string" && property === "tagPosition") {
              membersData[index].tagPosition = value as TagPosition;
          } else {
              console.error("Expected string, received:", value);
              membersData[index][property] = "";
          }
      }
  }
  return membersData;
}