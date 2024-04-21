import { Member } from "../api";
import { TagPosition } from "./TagPosition";

export type MemberName = 'てつや' | 'しばゆー' | 'りょう' | 'としみつ' | 'ゆめまる' | '虫眼鏡';

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

const unitNames: Record<string, string> = {
  "てつや_しばゆー": "不潔チーム",
  "てつや_りょう": "高身長イケメンチーム",
  "てつや_としみつ": "痔持っチー",
  "てつや_ゆめまる": "チーム下校",
  "てつや_虫眼鏡": "チームガスト",
  "しばゆー_りょう": "チームファラオ",
  "しばゆー_としみつ": "おもしろスナイパーズ",
  "しばゆー_ゆめまる": "チーム喧嘩親父",
  "しばゆー_虫眼鏡": "チーム貧弱",
  "りょう_としみつ": "アンチウンチ",
  "りょう_ゆめまる": "チームいじめっこ",
  "りょう_虫眼鏡": "チーム虫眼鏡",
  "としみつ_ゆめまる": "チーム末っ子",
  "としみつ_虫眼鏡": "野球大好きおじさん",
  "ゆめまる_虫眼鏡": "お酒大好き好きチーム",
  "てつや_しばゆー_りょう": "チーム一重",
  "としみつ_ゆめまる_虫眼鏡": "夢の超激レアユニット組まズ",
  "てつや_しばゆー_としみつ": "チーム目立ちたがり屋",
  "りょう_ゆめまる_虫眼鏡": "お料理組合",
  "てつや_しばゆー_ゆめまる": "冬生まれバカオナラトリオ「プープーズ」",
  "りょう_としみつ_虫眼鏡": "夏生まれチーム",
  "てつや_しばゆー_虫眼鏡": "オタクチーム",
  "りょう_としみつ_ゆめまる": "非オタチーム",
  "てつや_りょう_としみつ": "チーム人間",
  "しばゆー_ゆめまる_虫眼鏡": "チームキャラクター",
  "てつや_りょう_ゆめまる": "陸上部",
  "しばゆー_としみつ_虫眼鏡": "東岡ギャング",
  "てつや_りょう_虫眼鏡": "チームエイリアン捕まえた",
  "しばゆー_としみつ_ゆめまる": "トリコチーム",
  "てつや_としみつ_ゆめまる": "文系チーム",
  "しばゆー_りょう_虫眼鏡": "理系チーム",
  "てつや_としみつ_虫眼鏡": "AV大好きチーム",
  "しばゆー_りょう_ゆめまる": "SEX大好きチーム",
  "てつや_ゆめまる_虫眼鏡": "エロス",
  "しばゆー_りょう_としみつ": "チームハイゼンベルク"
};

const unitNameToRomaji: Record<string, string> = {
  不潔チーム: "fuketsu_team",
  高身長イケメンチーム: "koushincho_ikemen_team",
  痔持っチー: "jimotsu_team",
  チーム下校: "team_gekou",
  チームガスト: "team_gusto",
  チームファラオ: "team_pharaoh",
  おもしろスナイパーズ: "omoshiro_snipers",
  チーム喧嘩親父: "team_kenka_oyaji",
  チーム貧弱: "team_hinjaku",
  アンチウンチ: "anti_unchi",
  チームいじめっこ: "team_ijimekko",
  チーム虫眼鏡: "team_mushimegane",
  チーム末っ子: "team_makko",
  野球大好きおじさん: "yakyuu_daisuki_ojisan",
  お酒大好き好きチーム: "osake_daisuki_team",
  チーム一重: "team_hitoe",
  夢の超激レアユニット組まズ: "yume_no_chougeki_rare_unit_kumazu",
  チーム目立ちたがり屋: "team_medachitagariya",
  お料理組合: "oryouri_kumiai",
  "冬生まれバカオナラトリオ「プープーズ」": "fuyu_umare_baka_onara_trio_poopooz",
  夏生まれチーム: "natsu_umare_team",
  オタクチーム: "otaku_team",
  非オタチーム: "hi_otaku_team",
  チーム人間: "team_ningen",
  チームキャラクター: "team_character",
  陸上部: "rikujou_bu",
  東岡ギャング: "higashioka_gang",
  チームエイリアン捕まえた: "team_alien_tsukamaeta",
  トリコチーム: "toriko_team",
  文系チーム: "bunkei_team",
  理系チーム: "rikei_team",
  AV大好きチーム: "av_daisuki_team",
  SEX大好きチーム: "sex_daisuki_team",
  エロス: "eros",
  チームハイゼンベルク: "team_heisenberg"
};


export const getUnitName = (members: Member[]): string => {
  if (members.length === 1) {
    return members[0].memberName;
  } else if (members.length >= 4) {
    return "4人以上";
  }
  const order: Record<MemberName, number> = {
    てつや: 1,
    しばゆー: 2,
    りょう: 3,
    としみつ: 4,
    ゆめまる: 5,
    虫眼鏡: 6
  };

  const memberNames = members
    .map(member => member.memberName)
    .sort((a, b) => (order[a as MemberName] - order[b as MemberName]));
  const key = memberNames.join('_');
  return unitNames[key] || memberNames.join('・');
}

export const convertUnitNameToRomaji = (unitName: string): string => {
  console.log("unitName",unitName);
  return unitNameToRomaji[unitName];
};

export const getFolderPrefix = (membersData: Member[]): string => {
  const numberOfMembers = membersData.length;
  if (numberOfMembers === 2) {
    return "二人組/";
  } else if (numberOfMembers === 3) {
    return "三人組/";
  } else {
    return "";
  }
}
